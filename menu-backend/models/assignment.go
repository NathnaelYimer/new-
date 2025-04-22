// models/product_assignment.go
package models

type AssignedProduct struct {
	Name  string  `bson:"name" json:"name"`
	Price float64 `bson:"price" json:"price"`
}

type ProductAssignment struct {
	Level    string            `bson:"level" json:"level"`
    Price    float64           `bson:"price" json:"price"`
    Visible  bool              `bson:"visible" json:"visible"`
	Products []AssignedProduct `bson:"products" json:"products"`
}
