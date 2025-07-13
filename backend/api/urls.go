package api

import (
	"net/http"
	"strconv"

	"github.com/RaAlMer/Sykell_URL_task/backend/crawler"
	"github.com/RaAlMer/Sykell_URL_task/backend/database"
	"github.com/RaAlMer/Sykell_URL_task/backend/models"

	"github.com/gin-gonic/gin"
)

type CreateURLRequest struct {
	Address string `json:"address" binding:"required,url"`
}

// POST /urls
func CreateURL(c *gin.Context) {
	var req CreateURLRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL"})
		return
	}

	var existing models.URL
	if err := database.DB.Where("address = ?", req.Address).First(&existing).Error; err == nil {
		// URL already exists, return existing record
		c.JSON(http.StatusOK, existing)
		return
	}

	url := models.URL{
		Address: req.Address,
		Status:  "queued",
	}

	if err := database.DB.Create(&url).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store URL"})
		return
	}

	go func(id uint, addr string) {
		database.DB.Model(&models.URL{}).Where("id = ?", id).Update("status", "running")

		result, err := crawler.Crawl(addr)
		if err != nil {
			database.DB.Model(&models.URL{}).Where("id = ?", id).Update("status", "error")
			return
		}

		database.DB.Model(&models.URL{}).Where("id = ?", id).Updates(map[string]interface{}{
			"status":         "done",
			"html_version":   result.HTMLVersion,
			"title":          result.Title,
			"h1_count":       result.H1Count,
			"h2_count":       result.H2Count,
			"h3_count":       result.H3Count,
			"h4_count":       result.H4Count,
			"h5_count":       result.H5Count,
			"h6_count":       result.H6Count,
			"internal_links": result.InternalLinks,
			"external_links": result.ExternalLinks,
			"broken_links":   result.BrokenLinks,
			"has_login_form": result.HasLoginForm,
		})

		var brokenLinks []models.BrokenLink
		for _, b := range result.BrokenLinkDetails {
			brokenLinks = append(brokenLinks, models.BrokenLink{
				URLID:      id,
				URL:        b.URL,
				StatusCode: b.StatusCode,
			})
		}
		if len(brokenLinks) > 0 {
			database.DB.Create(&brokenLinks)
		}
	}(url.ID, url.Address)

	c.JSON(http.StatusCreated, url)
}

// GET /urls
func ListURLs(c *gin.Context) {
	// Default pagination
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")
	sortBy := c.DefaultQuery("sort_by", "created_at")
	order := c.DefaultQuery("order", "desc")
	status := c.Query("status")

	pageInt, _ := strconv.Atoi(page)
	limitInt, _ := strconv.Atoi(limit)
	offset := (pageInt - 1) * limitInt

	var urls []models.URL
	query := database.DB.Model(&models.URL{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Count for pagination
	var total int64
	query.Count(&total)

	// Apply sorting and limit
	if order != "asc" && order != "desc" {
		order = "desc"
	}
	query = query.Order(sortBy + " " + order).Limit(limitInt).Offset(offset)

	// Fetch records
	if err := query.Find(&urls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve URLs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       urls,
		"total":      total,
		"page":       pageInt,
		"limit":      limitInt,
		"totalPages": int((total + int64(limitInt) - 1) / int64(limitInt)),
	})
}

// GET /urls/:id
func GetURLByID(c *gin.Context) {
	id := c.Param("id")

	var url models.URL
	if err := database.DB.Preload("BrokenLinksList").First(&url, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	c.JSON(http.StatusOK, url)
}
