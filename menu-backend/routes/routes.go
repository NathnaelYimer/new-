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

	return router
}