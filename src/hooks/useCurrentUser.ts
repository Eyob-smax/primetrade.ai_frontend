import { useState, useEffect } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
};

export default function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "http://localhost:9000/auth/current-user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const { success, data } = await response.json();

        if (success) {
          setUser(data);
        } else {
          throw new Error("Failed to fetch user");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch user";
        setError(message);
        console.error("useCurrentUser error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();

    return () => {
      // Cleanup function
    };
  }, []);

  return { user, error, loading };
}
