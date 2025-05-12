import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Define the user interface
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
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
    fs.writeFileSync(
      usersFilePath,
      JSON.stringify(
        {
          users: [
            {
              id: "1",
              name: "Caroline Mitchem",
              email: "caroline.mitchem@capco.com",
              password: "password123",
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
  console.log("Looking for user with email:", email);
  const users = getUsers();
  console.log("Available users:", users);
  const user = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );
  console.log("User found:", user);
  return user;
};

// Create a new user
export const createUser = (userData: Omit<User, "id">): User | null => {
  // Check if user already exists
  if (findUserByEmail(userData.email)) {
    return null; // User already exists
  }

  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: uuidv4(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
};

// Validate user credentials
export const validateCredentials = (
  email: string,
  password: string
): User | null => {
  console.log("Validating credentials for:", email);
  const user = findUserByEmail(email);
  console.log("User found during validation:", user);

  if (user && user.password === password) {
    console.log("Password match - authentication successful");
    return user;
  }

  console.log("Password mismatch or user not found");
  return null;
};
