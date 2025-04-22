package routes

import (
	"menu-backend/controllers"
	"github.com/gorilla/mux"
)


func RegisterRoutes() *mux.Router {

	router := mux.NewRouter()
	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/menu", controllers.GetProducts).Methods("GET")
	api.HandleFunc("/assignments", controllers.GetAssignments).Methods("GET")
	api.HandleFunc("/assignments/{id}", controllers.GetAssignmentByID).Methods("GET")
	api.HandleFunc("/product/{id}", controllers.GetProductByID).Methods("GET")
	// create product
	api.HandleFunc("/product", controllers.CreateProduct).Methods("POST")
	// update product
	api.HandleFunc("/updateProduct", controllers.UpdateProduct).Methods("PUT")
	// delete product
	api.HandleFunc("/deleteProduct/{id}", controllers.DeleteProduct).Methods("DELETE")
	return router
}