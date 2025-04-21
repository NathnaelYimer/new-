package models

type ProductAssignment struct {
    Level    string   `bson:"level" json:"level"`
    Products []string `bson:"products" json:"products"`
}
