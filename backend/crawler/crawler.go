package crawler

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/net/html"
)

type CrawlResult struct {
	HTMLVersion   string
	Title         string
	H1Count       int
	H2Count       int
	H3Count       int
	H4Count       int
	H5Count       int
	H6Count       int
	InternalLinks int
	ExternalLinks int
	BrokenLinks   int
	HasLoginForm  bool
}

func Crawl(targetURL string) (*CrawlResult, error) {
	resp, err := http.Get(targetURL)
	if err != nil {
		return nil, fmt.Errorf("failed to GET URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("URL returned HTTP status %d", resp.StatusCode)
	}

	rootNode, err := html.Parse(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %w", err)
	}
	doc := goquery.NewDocumentFromNode(rootNode)

	result := &CrawlResult{
		Title:         doc.Find("title").Text(),
		HasLoginForm:  doc.Find("form input[type='password']").Length() > 0,
		HTMLVersion:   detectHTMLVersion(rootNode),
		H1Count:       doc.Find("h1").Length(),
		H2Count:       doc.Find("h2").Length(),
		H3Count:       doc.Find("h3").Length(),
		H4Count:       doc.Find("h4").Length(),
		H5Count:       doc.Find("h5").Length(),
		H6Count:       doc.Find("h6").Length(),
		InternalLinks: 0,
		ExternalLinks: 0,
		BrokenLinks:   0,
	}

	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		href, _ := s.Attr("href")
		href = strings.TrimSpace(href)
		if href == "" || strings.HasPrefix(href, "#") || strings.HasPrefix(href, "mailto:") {
			return
		}

		if isInternalLink(href, targetURL) {
			result.InternalLinks++
		} else {
			result.ExternalLinks++
		}

		checkURL := href
		if strings.HasPrefix(href, "/") {
			checkURL = targetURL + href
		}
		if res, err := http.Head(checkURL); err != nil || res.StatusCode >= 400 {
			result.BrokenLinks++
		}
	})

	return result, nil
}

func isInternalLink(link string, baseURL string) bool {
	if strings.HasPrefix(link, "/") || !strings.HasPrefix(link, "http") {
		return true
	}
	return strings.Contains(link, baseURL)
}

func detectHTMLVersion(n *html.Node) string {
	if n.Type == html.DoctypeNode {
		name := strings.ToLower(n.Data)
		switch name {
		case "html":
			return "HTML5"
		case "html public \"-//w3c//dtd html 4.01 transitional//en\"":
			return "HTML 4.01 Transitional"
		case "html public \"-//w3c//dtd html 4.01 strict//en\"":
			return "HTML 4.01 Strict"
		case "html public \"-//w3c//dtd xhtml 1.0 strict//en\"":
			return "XHTML 1.0 Strict"
		default:
			return name
		}
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if version := detectHTMLVersion(c); version != "" {
			return version
		}
	}
	return "Unknown"
}
