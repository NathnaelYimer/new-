package main


import (
	"log"
	"net/http"
	"menu-backend/config"
	"menu-backend/routes"
	"github.com/joho/godotenv"
	"menu-backend/seed"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	config.ConnectDB()
	seed.SeedData()

	routes := routes.RegisterRoutes()
	log.Println("Server running at http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", routes))
}