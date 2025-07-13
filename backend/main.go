package main

import (
	"fmt"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/RaAlMer/Sykell_URL_task/backend/api"
	"github.com/RaAlMer/Sykell_URL_task/backend/database"
	"github.com/RaAlMer/Sykell_URL_task/backend/models"
)

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading .env file")
	}

	database.Connect()

	if err := database.DB.AutoMigrate(&models.URL{}, &models.BrokenLink{}); err != nil {
		fmt.Println("AutoMigrate error:", err)
		return
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := gin.Default()

	r.Use(cors.Default())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.POST("/urls", api.CreateURL)
	r.GET("/urls", api.ListURLs)
	r.GET("/urls/:id", api.GetURLByID)

	fmt.Println("Server running on port", port)
	r.Run(":" + port)
}
