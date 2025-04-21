package models

type LevelTerms struct {
    Level   string `bson:"level" json:"level"`
    Title   string `bson:"title" json:"title"`
    Content string `bson:"content" json:"content"` // HTML string
}
