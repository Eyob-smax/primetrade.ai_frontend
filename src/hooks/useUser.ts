import { createContext, useContext } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
