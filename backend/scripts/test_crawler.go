// This is a dev-only script for testing the crawler in isolation.
package main

import (
	"fmt"

	"github.com/RaAlMer/Sykell_URL_task/backend/crawler"
)

func main() {
	result, err := crawler.Crawl("https://wikipedia.org")
	if err != nil {
		panic(err)
	}
	fmt.Printf("%+v\n", result)
}
