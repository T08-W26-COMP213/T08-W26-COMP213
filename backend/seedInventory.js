const mongoose = require("mongoose");
require("dotenv").config();

const Inventory = require("./models/Inventory");

function calculateRiskLevel(stock, threshold) {
  if (stock <= threshold * 0.5) return "High";
  if (stock <= threshold) return "Medium";
  return "Low";
}

const rawInventory = [
  { itemName: "Surgical Masks", currentStock: 120, reorderThreshold: 50 },
  { itemName: "Latex Gloves", currentStock: 40, reorderThreshold: 50 },
  { itemName: "Sanitizer Bottles", currentStock: 15, reorderThreshold: 40 },
  { itemName: "IV Bags", currentStock: 8, reorderThreshold: 25 },
  { itemName: "Thermometers", currentStock: 60, reorderThreshold: 30 },
  { itemName: "Bandages", currentStock: 25, reorderThreshold: 30 }
];

const mockInventory = rawInventory.map((item) => ({
  ...item,
  riskLevel: calculateRiskLevel(item.currentStock, item.reorderThreshold)
}));

async function seedInventory() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/inventorydb"
    );

    console.log("Connected to MongoDB");

    await Inventory.deleteMany({});
    console.log("Old inventory removed");

    await Inventory.insertMany(mockInventory);
    console.log("Mock inventory inserted successfully");

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Seeding error:", error);
    await mongoose.connection.close();
  }
}

seedInventory();