package controllers


import (
	"context"
	"encoding/json"
	"menu-backend/config"
	"menu-backend/models"
	"net/http"
	"time"
)


// GetMenu handles the GET request for the menu
func GetProducts(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor,err := config.DB.Collection("products").Find(ctx, map[string]interface{}{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var products []models.Product
	for cursor.Next(ctx) {
		var product models.Product
		cursor.Decode(&product)
		products = append(products, product)    
	}                                                  
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}


func GetAssignments(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    cursor, err := config.DB.Collection("assignments").Find(ctx, map[string]interface{}{})
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    var assignments []models.ProductAssignment
    for cursor.Next(ctx) {
        var a models.ProductAssignment
        cursor.Decode(&a)
        assignments = append(assignments, a)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(assignments)
}
                 




 