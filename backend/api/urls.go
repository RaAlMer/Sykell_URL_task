package api

import (
	"net/http"

	"github.com/RaAlMer/Sykell_URL_task/backend/crawler"
	"github.com/RaAlMer/Sykell_URL_task/backend/database"
	"github.com/RaAlMer/Sykell_URL_task/backend/models"

	"github.com/gin-gonic/gin"
)

type CreateURLRequest struct {
	Address string `json:"address" binding:"required,url"`
}

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
	}(url.ID, url.Address)

	c.JSON(http.StatusCreated, url)
}
