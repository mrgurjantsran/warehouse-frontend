import Cookies from "js-cookie";
import { authAPI } from "./api";

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  warehouseId?: number;
}

export interface AuthToken {
  token: string;
  user: User;
}

// LOGIN FUNCTION
export const login = async (
  username: string,
  password: string
): Promise<AuthToken> => {
  const response = await authAPI.login(username, password);
  const { token, user } = response.data;

  // Save token + user in cookies
  Cookies.set("token", token, { path: "/" });
  Cookies.set("user", JSON.stringify(user), { path: "/" });

  return { token, user };
};

// LOGOUT
export const logout = () => {
  Cookies.remove("token");
  Cookies.remove("user");
};

// GET STORED USER
export const getStoredUser = (): User | null => {
  const user = Cookies.get("user");
  return user ? JSON.parse(user) : null;
};

// GET STORED TOKEN
export const getStoredToken = (): string | null => {
  return Cookies.get("token") || null;
};

// CHECK IF LOGGED IN
export const isAuthenticated = (): boolean => {
  return !!Cookies.get("token");
};
