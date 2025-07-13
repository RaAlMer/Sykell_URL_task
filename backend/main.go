package main

import (
	"fmt"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/RaAlMer/Sykell_URL_task/backend/api"
	"github.com/RaAlMer/Sykell_URL_task/backend/api/middleware"
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

	frontendOrigin := os.Getenv("FRONTEND_URL_BASE")
	if frontendOrigin == "" {
		frontendOrigin = "http://localhost:5173"
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Public endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Protected routes
	auth := r.Group("/")
	auth.Use(middleware.AuthRequired())
	{
		auth.POST("/urls", api.CreateURL)
		auth.GET("/urls", api.ListURLs)
		auth.GET("/urls/:id", api.GetURLByID)
		auth.DELETE("/urls/:id", api.DeleteURL)
		auth.POST("/urls/:id/rerun", api.RerunURL)
	}

	fmt.Println("Server running on port", port)
	r.Run(":" + port)
}
