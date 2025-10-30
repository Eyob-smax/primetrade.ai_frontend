import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  Bell,
  HelpCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle,
  RotateCcw,
  ArrowLeftRight,
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import useCurrentUser from "../hooks/useCurrentUser";

type UserType = {
  user_id: number;
  email: string;
  role: "ADMIN" | "USER";
  name: string;
};

export default function AdminPanel() {
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const pageSize = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const response = await fetch(`http://localhost:9000/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const data = await response.json();
        const allUsers = data.data || [];
        setUsers(allUsers);
        setTotalPages(Math.ceil(allUsers.length / pageSize));
        setDisplayedUsers(allUsers.slice(0, pageSize));
      } catch (err) {
        const message = (err as Error).message || "Unknown error";
        setError(message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setDisplayedUsers(users.slice(start, end));
  }, [currentPage, users]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteUser = async (userId: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:9000/user/${userId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        setSuccess("User deleted successfully.");
        const updatedUsers = users.filter((u) => u.user_id !== userId);
        setUsers(updatedUsers);
        setTotalPages(Math.ceil(updatedUsers.length / pageSize));
        if (displayedUsers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: (err as Error).message || "Failed to delete user",
        });
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <p className="text-zinc-900 dark:text-white">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <p className="text-danger">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          <RotateCcw className="mr-2" /> Retry
        </Button>
      </div>
    );
  }
  if (user?.role !== "ADMIN") {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "You do not have permission to access the Admin Panel.",
    }).then(() => {
      navigate("/");
    });
    return null;
  }
  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center justify-center border-b border-zinc-200 dark:border-b-[#223649] px-4 sm:px-10 py-3">
          <div className="flex items-center justify-between w-full max-w-6xl">
            <div className="flex items-center gap-4 text-zinc-900 dark:text-white">
              <div className="size-6 text-primary">
                <User />
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-tight text-zinc-900 dark:text-white">
                Admin Panel
              </h2>
            </div>
            <div className="flex flex-1 justify-end gap-2 sm:gap-4 items-center">
              <Button
                size="icon"
                variant="ghost"
                className="bg-zinc-200/50 dark:bg-[#223649] text-zinc-600 dark:text-white"
              >
                <Bell />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="bg-zinc-200/50 dark:bg-[#223649] text-zinc-600 dark:text-white"
              >
                <HelpCircle />
              </Button>
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                title="User avatar"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC0tdNTJTTsQe_rjZEIiQQn6FOe5RDYg1TIzRtnykGlSln1hCOGZdGK4fb4_LOL3u3dVnZTxpkXFmS2Pa2CWCxw4Csn0P6z7LyrZQ9iYMgGnfiXyyMeY_t6FjhN9BkIjrNshGR2LAm5BfCuwPkObgioIVutyLwKIRJn6-8G7j5LoZLXd68-IN49EGZZANfzWTp4o0rz4AJh4nCAu4qLfK7cLRJNZNwL20hzbipG77wCPf-gKpOsoH3plG5td2QGVNoEHbLxgJ3DvTCU")',
                }}
              />
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-10 py-2 w-full ">
          <div className="max-w-6xl mx-auto  flex items-center bg-background-light dark:bg-background-dark border-b border-zinc-200 dark:border-b-[#223649] justify-end">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-primary"
              onClick={handleBack}
            >
              <ArrowLeftRight size={16} />
              Back
            </Button>
          </div>
        </div>
        <main className="flex-1 flex flex-col items-center justify-center py-5 px-4 sm:px-10">
          <div className="flex w-full max-w-6xl flex-col flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4 py-4">
              <div className="flex min-w-72 flex-col gap-2">
                <p className="text-zinc-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                  Admin Management Panel
                </p>
                <p className="text-zinc-500 dark:text-[#90adcb] text-base font-normal leading-normal">
                  Manage all users, roles, and permissions.
                </p>
              </div>
            </div>
            {success && (
              <div className="my-4 p-4 rounded-lg bg-success/10 border border-success/30 text-success flex items-center gap-3">
                <CheckCircle className="text-success" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}
            <div className="py-3">
              <Card className="overflow-x-auto border border-zinc-200 dark:border-[#314d68] bg-background-light dark:bg-background-dark rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-100/50 dark:bg-[#182634] border-b border-zinc-200 dark:border-[#314d68]">
                      <TableCell className="w-[10%]">User ID</TableCell>
                      <TableCell className="w-[20%]">Name</TableCell>
                      <TableCell className="w-[30%]">Username/Email</TableCell>
                      <TableCell className="w-[15%]">Role</TableCell>
                      <TableCell className="w-[25%]">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedUsers.map((user) => (
                      <TableRow
                        key={user.user_id}
                        className="border-t border-zinc-200 dark:border-[#314d68]"
                      >
                        <TableCell className="text-zinc-500 dark:text-[#90adcb]">
                          {user.user_id}
                        </TableCell>
                        <TableCell className="text-zinc-900 dark:text-white">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-zinc-900 dark:text-white">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          {user.role === "ADMIN" ? (
                            <Badge className="bg-primary/20 text-primary">
                              Admin
                            </Badge>
                          ) : (
                            <Badge className="bg-zinc-200 dark:bg-[#223649] text-zinc-800 dark:text-white">
                              User
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-9 cursor-pointer hover:bg-danger/20 text-danger"
                              onClick={() => handleDeleteUser(user.user_id)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
            <div className="flex items-center justify-center p-4 gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-zinc-500 dark:text-white"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    className={`rounded-full size-10 ${
                      page === currentPage
                        ? "bg-primary text-white font-bold"
                        : "text-zinc-500 dark:text-white hover:bg-zinc-200/60 dark:hover:bg-white/10"
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                size="icon"
                variant="ghost"
                className="text-zinc-500 dark:text-white"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
