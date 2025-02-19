import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

interface User {
  id: number;
  uniqueId: string;
  username: string;
  email: string;
  phoneCode: string;
  phone: string;
  status: "Active" | "Inactive";
  createdAt?: string;
}

interface UserContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  totalUsers: number;
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const totalUsers = users.length;

  // Function to fetch users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Transform data if needed to match your interface
        const formattedUsers = data.map((user) => ({
          id: user.id,
          uniqueId: user.id || user.id,
          username: user.username,
          email: user.email,
          phoneCode: user.phone_code || user.phoneCode || "+1",
          phone: user.phone,
          status: user.status as "Active" | "Inactive",
          createdAt: user.created_at || user.createdAt,
        }));

        setUsers(formattedUsers);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();

    // Set up realtime subscription
    const usersSubscription = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          // Handle different events
          if (payload.eventType === "INSERT") {
            const newUser = payload.new as any;
            setUsers((prev) => [
              {
                id: newUser.id,
                uniqueId: newUser.unique_id || newUser.uniqueId,
                username: newUser.username,
                email: newUser.email,
                phoneCode: newUser.phone_code || newUser.phoneCode || "+1",
                phone: newUser.phone,
                status: newUser.status as "Active" | "Inactive",
                createdAt: newUser.created_at || newUser.createdAt,
              },
              ...prev,
            ]);
          } else if (payload.eventType === "UPDATE") {
            const updatedUser = payload.new as any;
            setUsers((prev) =>
              prev.map((user) =>
                user.id === updatedUser.id
                  ? {
                      id: updatedUser.id,
                      uniqueId: updatedUser.unique_id || updatedUser.uniqueId,
                      username: updatedUser.username,
                      email: updatedUser.email,
                      phoneCode:
                        updatedUser.phone_code || updatedUser.phoneCode || "+1",
                      phone: updatedUser.phone,
                      status: updatedUser.status as "Active" | "Inactive",
                      createdAt:
                        updatedUser.created_at || updatedUser.createdAt,
                    }
                  : user
              )
            );
          } else if (payload.eventType === "DELETE") {
            const deletedUser = payload.old as any;
            setUsers((prev) =>
              prev.filter((user) => user.id !== deletedUser.id)
            );
          }
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      usersSubscription.unsubscribe();
    };
  }, []);

  // Function to manually refresh users
  const refreshUsers = async () => {
    await fetchUsers();
  };

  return (
    <UserContext.Provider
      value={{
        users,
        setUsers,
        totalUsers,
        loading,
        error,
        refreshUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}
