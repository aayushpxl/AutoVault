const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");

// Load backend .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const VehicleDetail = require("../models/VehicleDetails");

const seedData = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        // Clear existing data (Optional, but good for clean seed)
        console.log("Clearing existing users and vehicles...");
        await User.deleteMany({});
        await VehicleDetail.deleteMany({});

        // Create Admin User
        const adminPassword = await bcrypt.hash("Admin@123", 10);
        const adminUser = new User({
            username: "admin",
            email: "admin@autovault.com",
            password: adminPassword,
            role: "admin",
            emailVerified: true,
            accountStatus: "active"
        });
        await adminUser.save();
        console.log("Admin user created: admin@autovault.com / Admin@123");

        // Create Normal User
        const userPassword = await bcrypt.hash("User@123", 10);
        const normalUser = new User({
            username: "biswash",
            email: "biswashg94@gmail.com",
            password: userPassword,
            role: "normal",
            emailVerified: true,
            accountStatus: "active"
        });
        await normalUser.save();
        console.log(`Normal user created: ${normalUser.email} / User@123`);

        // Create Dummy Vehicles
        const vehicles = [
            {
                vehicleName: "Tesla Model S",
                vehicleType: "Electric",
                fuelCapacityLitres: 0,
                loadCapacityKg: 500,
                passengerCapacity: "5",
                pricePerTrip: 1500,
                vehicleDescription: "High-performance electric luxury sedan with long range and advanced technology.",
                filepath: "tesla-model-s.jpg"
            },
            {
                vehicleName: "Ford F-150",
                vehicleType: "Truck",
                fuelCapacityLitres: 87,
                loadCapacityKg: 1500,
                passengerCapacity: "5",
                pricePerTrip: 2000,
                vehicleDescription: "Powerful and versatile pickup truck suitable for heavy-duty work and off-roading.",
                filepath: "ford-f150.jpg"
            },
            {
                vehicleName: "Honda Civic",
                vehicleType: "Sedan",
                fuelCapacityLitres: 47,
                loadCapacityKg: 400,
                passengerCapacity: "5",
                pricePerTrip: 800,
                vehicleDescription: "Reliable, fuel-efficient, and comfortable compact car for daily commuting.",
                filepath: "honda-civic.jpg"
            },
            {
                vehicleName: "Toyota RAV4",
                vehicleType: "SUV",
                fuelCapacityLitres: 55,
                loadCapacityKg: 600,
                passengerCapacity: "5",
                pricePerTrip: 1200,
                vehicleDescription: "Popular compact SUV offering durability, space, and a smooth ride.",
                filepath: "toyota-rav4.jpg"
            }
        ];

        await VehicleDetail.insertMany(vehicles);
        console.log("Dummy vehicles seeded.");

        console.log("Database seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedData();
