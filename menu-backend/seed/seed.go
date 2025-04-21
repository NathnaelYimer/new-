package seed

import (
	"context"
	"log"
	"time"

	"menu-backend/config"
	"menu-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func SeedData() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	productCollection := config.DB.Collection("products")
	assignmentCollection := config.DB.Collection("assignments")

	// Check if products are already seeded
	count, _ := productCollection.CountDocuments(ctx, bson.M{})
	if count == 0 {
		seedProducts(ctx, productCollection)
	}

	// Check if assignments are already seeded
	count, _ = assignmentCollection.CountDocuments(ctx, bson.M{})
	if count == 0 {
		seedAssignments(ctx, assignmentCollection)
	}
}

func seedProducts(ctx context.Context, collection *mongo.Collection) {
	products := []models.Product{
		{
			Name:        "Extended Warranty",
			Price:       613.16,
			Description: "Comprehensive coverage that extends the manufacturer's warranty, protecting your vehicle against mechanical and electrical failures beyond the original warranty period.",
			Terms:       "Coverage varies by plan level. Deductibles may apply. Valid at any authorized service center. Transferable if vehicle is sold. Exclusions apply for wear and tear items and routine maintenance.",
		},
		{
			Name:        "Rust Proofing",
			Price:       617.94,
			Description: "Advanced protection that helps prevent rust and corrosion on your vehicle's body and undercarriage, extending its lifespan and maintaining its value.",
			Terms:       "Annual inspections required to maintain coverage. Covers perforation due to rust from the inside out. Does not cover surface rust from external damage. 5-year warranty included.",
		},
		{
			Name:        "Paint Protection",
			Price:       608.39,
			Description: "Premium sealant that creates a protective barrier over your vehicle's paint, guarding against environmental damage, UV rays, and minor scratches.",
			Terms:       "Requires proper maintenance and care. Not a substitute for regular washing. Does not cover damage from accidents or improper care. Reapplication recommended every 2 years.",
		},
		{
			Name:        "Fabric/Leather Protection",
			Price:       261.84,
			Description: "Specialized treatment that repels stains and spills on your vehicle's interior surfaces, making cleanup easier and preserving the appearance of seats and carpets.",
			Terms:       "Spills must be cleaned promptly. Does not prevent damage from sharp objects or burns. Reapplication may be necessary after deep cleaning. 3-year protection plan included.",
		},
		{
			Name:        "Key Fob Replacement",
			Price:       871.21,
			Description: "Coverage for the repair or replacement of your vehicle's key fob in case of loss, theft, or damage, saving you from expensive dealer replacement costs.",
			Terms:       "Limited to 2 replacements per contract period. $50 deductible per claim. Programming fees included. Must provide proof of loss or damage. 24-hour assistance available.",
		},
		{
			Name:        "GAP",
			Price:       990.27,
			Description: "Guaranteed Asset Protection covers the difference between what you owe on your vehicle and its actual cash value if it's totaled or stolen.",
			Terms:       "Must be purchased within 30 days of vehicle financing. Maximum benefit of $50,000. Primary insurance deductible coverage up to $1,000. Not available for leased vehicles in some states.",
		},
		{
			Name:        "Scratch/Dent Repair",
			Price:       1095.96,
			Description: "Convenient repair service for minor scratches, dents, and dings on your vehicle's exterior, maintaining its appearance and value without affecting your insurance.",
			Terms:       "Repairs limited to dents smaller than 4 inches in diameter. Paint touch-up for scratches less than 6 inches. Unlimited number of repairs during contract period. $0 deductible per claim.",
		},
	}

	// Convert to interface{} for InsertMany
	var docs []interface{}
	for _, p := range products {
		docs = append(docs, p)
	}

	_, err := collection.InsertMany(ctx, docs)
	if err != nil {
		log.Println("Error inserting products:", err)
	} else {
		log.Println("✅ Products seeded.")
	}
}

func seedAssignments(ctx context.Context, collection *mongo.Collection) {

	assignments := []models.ProductAssignment{
		{Level: "platinum", Products: []string{"Extended Warranty", "Rust Proofing", "Paint Protection", "Fabric/Leather Protection", "Key Fob Replacement", "GAP", "Scratch/Dent Repair"}},
		{Level: "gold", Products: []string{"Extended Warranty", "Rust Proofing", "Paint Protection", "Fabric/Leather Protection", "Key Fob Replacement", "GAP"}},
		{Level: "silver", Products: []string{"Extended Warranty", "Rust Proofing", "Paint Protection", "Key Fob Replacement", "GAP"}},
		{Level: "bronze", Products: []string{"Extended Warranty", "Key Fob Replacement", "GAP"}},
		{Level: "iron", Products: []string{"Extended Warranty", "Key Fob Replacement"}},
	}

	var docs []interface{}
	for _, a := range assignments {
		docs = append(docs, a)
	}

	_, err := collection.InsertMany(ctx, docs)
	if err != nil {
		log.Println("Error inserting assignments:", err)
	} else {
		log.Println("✅ Assignments seeded.")
	}
}
