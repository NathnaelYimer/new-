package models

type Product struct {
    Name        string  `bson:"name" json:"name"`
    Price       float64 `bson:"price" json:"price"`
    Description string  `bson:"description" json:"description"`
    Terms       string  `bson:"terms" json:"terms"`
}
                        