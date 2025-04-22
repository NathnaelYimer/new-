package controllers


import (
	"context"
	"encoding/json"
	"menu-backend/config"
	"menu-backend/models"
	"net/http"
	"time"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"fmt"
	"regexp"
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


func GetAssignmentByID(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	vars := mux.Vars(r)
	id := vars["id"]
	objID, _ := primitive.ObjectIDFromHex(id)
	if id == "" {
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	var assignment models.ProductAssignment
	err := config.DB.Collection("assignments").FindOne(ctx, map[string]interface{}{"_id": objID}).Decode(&assignment)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assignment)
}



func GetProductByID(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	var product models.Product
	err := config.DB.Collection("products").FindOne(ctx, map[string]interface{}{"_id": id}).Decode(&product)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}


func CreateProduct(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var product models.Product
	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Case-insensitive check for existing product name
	filter := bson.M{
		"name": bson.M{
			"$regex":   fmt.Sprintf("^%s$", product.Name),
			"$options": "i", // case-insensitive
		},
	}

	var existingProduct models.Product
	err = config.DB.Collection("products").FindOne(ctx, filter).Decode(&existingProduct)
	if err == nil {
		http.Error(w, "Product with this name already exists", http.StatusConflict)
		return
	}
	if err != mongo.ErrNoDocuments {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Insert the new product
	_, err = config.DB.Collection("products").InsertOne(ctx, product)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}



func UpdateProduct(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var updates map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&updates)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	idRaw, ok := updates["_id"]
	if !ok {
		http.Error(w, "Missing _id field", http.StatusBadRequest)
		return
	}

	objectID, err := primitive.ObjectIDFromHex(idRaw.(string))
	if err != nil {
		http.Error(w, "Invalid _id format", http.StatusBadRequest)
		return
	}
	delete(updates, "_id")


	filter := bson.M{"_id": objectID}
	// Check if the product exists before updating
	var existingProduct models.Product
	err = config.DB.Collection("products").FindOne(ctx, filter).Decode(&existingProduct)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Product not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = config.DB.Collection("products").UpdateOne(
		ctx,
		filter,
		map[string]interface{}{"$set": updates},
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Product updated successfully"})
}


func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Start a session for the transaction
	session, err := config.DB.Client().StartSession()
	if err != nil {
		http.Error(w, "Failed to start session: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer session.EndSession(ctx)

	// Handle transaction using session.WithTransaction
	_, err = session.WithTransaction(ctx, func(sessCtx mongo.SessionContext) (interface{}, error) {
		// Get the product ID from URL
		vars := mux.Vars(r)
		id := vars["id"]
		if id == "" {
			return nil, fmt.Errorf("ID is required")
		}

		// Convert the ID to ObjectID
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			return nil, fmt.Errorf("Invalid ID format")
		}

		// Step 1: Find the product to delete (for pulling its name later)
		var product models.Product
		err = config.DB.Collection("products").FindOne(sessCtx, bson.M{"_id": objectID}).Decode(&product)
		fmt.Printf("Product found: %+v\n", product)
		if err != nil {
			return nil, fmt.Errorf("Product not found",err)
		}
		


		// Step 2: Delete the product from the products collection inside the transaction
		_, err = config.DB.Collection("products").DeleteOne(sessCtx, bson.M{"_id": objectID})
		if err != nil {
			return nil, fmt.Errorf("Failed to delete product: %w", err)
		}

		// Step 3: Case-insensitive pull from ProductAssignments collection inside the transaction
		_, err = config.DB.Collection("assignments").UpdateMany(
			sessCtx,
			bson.M{"products.name": bson.M{"$regex": "^" + regexp.QuoteMeta(product.Name) + "$", "$options": "i"}},
			bson.M{"$pull": bson.M{"products": bson.M{"name": bson.M{"$regex": "^" + regexp.QuoteMeta(product.Name) + "$", "$options": "i"}}}},
		)
		if err != nil {
			return nil, fmt.Errorf("Failed to remove product from assignments: %w", err)
		}

		// Return nil to indicate the transaction was successful
		return nil, nil
	})

	// If there was an error in the transaction, abort it
	if err != nil {
		http.Error(w, "Failed to complete transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Product deleted successfully"})
}




 