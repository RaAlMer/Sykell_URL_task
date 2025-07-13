package models

import "time"

type URL struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	Address string `gorm:"unique;not null" json:"address"`
	Status  string `gorm:"default:queued" json:"status"` // queued, running, done, error

	HTMLVersion string `json:"html_version,omitempty"`
	Title       string `json:"title,omitempty"`

	H1Count int `json:"h1_count,omitempty"`
	H2Count int `json:"h2_count,omitempty"`
	H3Count int `json:"h3_count,omitempty"`
	H4Count int `json:"h4_count,omitempty"`
	H5Count int `json:"h5_count,omitempty"`
	H6Count int `json:"h6_count,omitempty"`

	InternalLinks   int          `json:"internal_links,omitempty"`
	ExternalLinks   int          `json:"external_links,omitempty"`
	BrokenLinks     int          `json:"broken_links,omitempty"`
	BrokenLinksList []BrokenLink `json:"broken_links_details" gorm:"foreignKey:URLID"`

	HasLoginForm bool `json:"has_login_form,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
