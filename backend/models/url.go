package models

import "time"

type URL struct {
    ID           uint      `gorm:"primaryKey" json:"id"`
    Address      string    `gorm:"unique;not null" json:"address"`
    Status       string    `gorm:"default:queued" json:"status"` // queued, running, done, error
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}
