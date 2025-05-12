import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

// Define the user interface
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // This will store the hashed password
}

// Path to the users JSON file
const usersFilePath = path.join(process.cwd(), "data", "users.json");

// Make sure the data directory exists
export const ensureDataDirectory = () => {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create the users file if it doesn't exist
  if (!fs.existsSync(usersFilePath)) {
    // Create a hashed password for the default admin
    const hashedPassword = bcrypt.hashSync("password123", 10);

    fs.writeFileSync(
      usersFilePath,
      JSON.stringify(
        {
          users: [
            {
              id: "1",
              name: "Admin User",
              email: "caroline.mitchem@oncor.com",
              password: hashedPassword,
            },
          ],
        },
        null,
        2
      )
    );
  }
};

// Get all users from the JSON file
export const getUsers = (): User[] => {
  ensureDataDirectory();
  try {
    const fileContents = fs.readFileSync(usersFilePath, "utf8");
    const data = JSON.parse(fileContents);
    return data.users || [];
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
};

// Save users to the JSON file
export const saveUsers = (users: User[]): void => {
  ensureDataDirectory();
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
  }
};

// Find a user by email
export const findUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

// Create a new user with hashed password
export const createUser = (userData: {
  name: string;
  email: string;
  password: string;
}): User | null => {
  // Check if user already exists
  if (findUserByEmail(userData.email)) {
    return null; // User already exists
  }

  const users = getUsers();

  // Hash the password before storing
  const hashedPassword = bcrypt.hashSync(userData.password, 10);

  const newUser: User = {
    id: uuidv4(),
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
};

// Validate user credentials with secure password comparison
export const validateCredentials = (
  email: string,
  password: string
): User | null => {
  const user = findUserByEmail(email);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return null;
};
