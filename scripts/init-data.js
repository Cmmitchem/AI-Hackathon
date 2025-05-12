const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

// Path to the data directory and users JSON file
const dataDir = path.join(process.cwd(), "data");
const usersFilePath = path.join(dataDir, "users.json");

// Create the data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  console.log("Creating data directory...");
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create the users file with a default admin user if it doesn't exist
if (!fs.existsSync(usersFilePath)) {
  console.log("Creating users.json file with default admin user...");

  // Hash the default password
  const hashedPassword = bcrypt.hashSync("password123", 10);

  const defaultUsers = {
    users: [
      {
        id: "1",
        name: "Admin User",
        email: "caroline.mitchem@oncor.com",
        password: hashedPassword,
      },
    ],
  };

  fs.writeFileSync(usersFilePath, JSON.stringify(defaultUsers, null, 2));
  console.log("Default users.json created with secure password hashing.");
} else {
  console.log("users.json already exists.");
}

console.log("Data initialization complete.");
