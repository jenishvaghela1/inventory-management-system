"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  hasAccounts: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  createAccount: (
    email: string,
    password: string,
    name: string,
    role: "admin" | "user",
  ) => Promise<void>;
  updateAccount: (
    id: string,
    email: string,
    name: string,
    role: "admin" | "user",
  ) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  getAllAccounts: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAccounts, setHasAccounts] = useState(false);

  useEffect(() => {
    // Check for existing accounts
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    setHasAccounts(users.length > 0);

    // If no accounts exist, skip authentication
    if (users.length === 0) {
      setIsAuthenticated(true);
      return;
    }

    // Check for existing session
    const storedUser = localStorage.getItem("auth_user");
    const storedSession = localStorage.getItem("auth_session");

    if (storedUser && storedSession) {
      const sessionData = JSON.parse(storedSession);
      const now = new Date().getTime();

      // Check if session is still valid (24 hours)
      if (now - sessionData.timestamp < 24 * 60 * 60 * 1000) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        // Session expired
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_session");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get stored users
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userRecord = users.find(
      (u: any) => u.email === email && u.password === password,
    );

    if (!userRecord) {
      throw new Error("Invalid email or password");
    }

    const userData: User = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      createdAt: userRecord.createdAt,
    };

    setUser(userData);
    setIsAuthenticated(true);

    // Store session
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem(
      "auth_session",
      JSON.stringify({ timestamp: new Date().getTime() }),
    );
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_session");
  };

  const updateProfile = async (name: string, email: string) => {
    if (!user) throw new Error("No user logged in");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update users storage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === user.id);

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], name, email };
      localStorage.setItem("users", JSON.stringify(users));

      const updatedUser = { ...user, name, email };
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    if (!user) throw new Error("No user logged in");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify current password
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userRecord = users.find((u: any) => u.id === user.id);

    if (!userRecord || userRecord.password !== currentPassword) {
      throw new Error("Current password is incorrect");
    }

    // Update password
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));
    }
  };

  const createAccount = async (
    email: string,
    password: string,
    name: string,
    role: "admin" | "user",
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get existing users
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      throw new Error("User with this email already exists");
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password, // In real app, this would be hashed
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    setHasAccounts(true);

    // If this is the first account and no one is logged in, auto-login
    if (users.length === 1 && !user) {
      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt,
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      localStorage.setItem(
        "auth_session",
        JSON.stringify({ timestamp: new Date().getTime() }),
      );
    }
  };

  const updateAccount = async (
    id: string,
    email: string,
    name: string,
    role: "admin" | "user",
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === id);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // Check if email is already taken by another user
    const existingUser = users.find(
      (u: any) => u.email === email && u.id !== id,
    );
    if (existingUser) {
      throw new Error("Email is already taken by another user");
    }

    users[userIndex] = { ...users[userIndex], email, name, role };
    localStorage.setItem("users", JSON.stringify(users));

    // Update current user if it's the same user
    if (user && user.id === id) {
      const updatedUser = { ...user, email, name, role };
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    }
  };

  const deleteAccount = async (id: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const filteredUsers = users.filter((u: any) => u.id !== id);

    if (filteredUsers.length === users.length) {
      throw new Error("User not found");
    }

    localStorage.setItem("users", JSON.stringify(filteredUsers));
    setHasAccounts(filteredUsers.length > 0);

    // If the deleted user is the current user, logout
    if (user && user.id === id) {
      logout();
    }
  };

  const getAllAccounts = (): User[] => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    return users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        hasAccounts,
        login,
        logout,
        updateProfile,
        changePassword,
        createAccount,
        updateAccount,
        deleteAccount,
        getAllAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
