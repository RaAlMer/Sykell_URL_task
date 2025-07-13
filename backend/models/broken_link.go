package models

import "time"

type BrokenLink struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	URLID      uint   `gorm:"index" json:"url_id"`
	URL        string `json:"url"`
	StatusCode int    `json:"status_code"`

	CreatedAt time.Time `json:"created_at"`
}
