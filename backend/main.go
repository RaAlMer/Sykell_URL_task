package main

import (
    "fmt"
    "os"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
)

func main() {
    // Load .env file
    err := godotenv.Load()
    if err != nil {
        fmt.Println("Error loading .env file")
    }

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080" // fallback
    }

    r := gin.Default()

    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })

    fmt.Println("Server running on port", port)
    r.Run(":" + port)
}
