package api

import (
	"net/http"

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

	url := models.URL{
		Address: req.Address,
		Status:  "queued",
	}

	if err := database.DB.Create(&url).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store URL"})
		return
	}

	c.JSON(http.StatusCreated, url)
}
