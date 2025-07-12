package main

import (
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/RaAlMer/Sykell_URL_task/backend/api"
	"github.com/RaAlMer/Sykell_URL_task/backend/database"
)

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading .env file")
	}

	database.Connect()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.POST("/urls", api.CreateURL)
	r.GET("/urls", api.ListURLs)

	fmt.Println("Server running on port", port)
	r.Run(":" + port)
}
