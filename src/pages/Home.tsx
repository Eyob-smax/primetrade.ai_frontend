import { useEffect, useState } from "react";
import {
  Plus,
  CloudCheck,
  Pencil,
  Trash2,
  Eye,
  Package,
  ToolCase,
  Shield,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/table";
import { deleteProduct, fetchProducts } from "../data/api";
import { useNavigate } from "react-router-dom";
import type { ProductPayload, ReturnedProducts } from "../lib/types";
import Swal from "sweetalert2";
import useCurrentUser from "../hooks/useCurrentUser";

export default function Home() {
  const [products, setProducts] = useState<ProductPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const navigate = useNavigate();
  const { error, loading: currentUserLoading, user } = useCurrentUser();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const raw = await fetchProducts();
        console.log("Raw fetchProducts response:", raw);
        if ("cached" in raw && raw.cached) {
          setFromCache(true);
        }

        if ("error" in raw) {
          Swal.fire({
            icon: "error",
            title: (raw as { message?: string }).message || "Error",
            text: "Your session has expired. Please log in again.",
          });
          navigate("/login");
          return;
        }
        if (
          !raw ||
          !(raw as ReturnedProducts).data ||
          !(raw as ReturnedProducts).data.products
        ) {
          throw new Error("Invalid response format from fetchProducts");
        }

        const data = (raw as ReturnedProducts).data.products;
        setProducts(data);
        setEmpty(data.length === 0);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: (err as Error).message || "Failed to load products",
        });
        setProducts([]);
        setEmpty(true);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
      }).then(() => {
        navigate("/login");
      });
    }
  }, [error, navigate]);

  const handleAddProduct = () => navigate("/product-form");

  const handleEditProduct = (product: ProductPayload) =>
    navigate("/product-form", {
      state: { productId: product.id, isEdit: true },
    });

  const handleDeleteProduct = (productId: number) => {
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== productId);
      setEmpty(filtered.length === 0);
      return filtered;
    });
    (async () => {
      try {
        const deleted = await deleteProduct(productId);
        if (!deleted.success) {
          throw new Error(deleted.message || "Failed to delete product");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: (error as Error).message || "Failed to delete product",
        });
      }
    })();
    Swal.fire({
      icon: "success",
      title: "Deleted",
      text: "Product deleted successfully",
    });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("http://localhost:9000/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.message === "Logout successful") navigate("/login");
      else Swal.fire({ icon: "error", title: data.message || "Logout Failed" });
    } catch {
      Swal.fire({ icon: "error", title: "Logout Failed" });
    } finally {
      setLoggingOut(false);
    }
  };

  const goToAdminPanel = () => navigate("/protected");

  if (currentUserLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="flex flex-col gap-3 p-4 w-full max-w-md">
          <p className="text-[#333] dark:text-gray-300 text-base font-medium text-center">
            Loading...
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full animate-pulse"
              style={{ width: "45%" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center w-full">
        <div className="w-full max-w-5xl px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-col flex-1">
          <header className="flex items-center justify-between border-b border-[#DEE2E6] dark:border-gray-700 px-6 py-4 bg-white dark:bg-[#1C2A38] rounded-t-xl">
            <div className="flex items-center gap-4 text-[#333] dark:text-gray-100">
              <ToolCase className="text-primary w-6 h-6" />
              <h2 className="text-lg font-bold leading-tight tracking-tight">
                Product Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {user?.role === "ADMIN" && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 font-bold border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={goToAdminPanel}
                >
                  <Shield size={16} />
                  Admin Panel
                </Button>
              )}

              {user?.role === "ADMIN" && (
                <Button
                  className={`flex items-center gap-2 min-w-[84px] bg-primary text-white hover:bg-primary/90 font-bold`}
                  onClick={handleAddProduct}
                  disabled={loading || user?.role !== "ADMIN"}
                >
                  <Plus size={16} />
                  <span className="truncate">Add Product</span>
                </Button>
              )}

              <Button
                variant="secondary"
                className="font-bold"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging Out..." : "Logout"}
              </Button>
            </div>
          </header>

          <main className="bg-white dark:bg-[#1C2A38] p-6 rounded-b-xl grow">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
              <div className="flex min-w-72 flex-col gap-2">
                <p className="text-[#333] dark:text-white text-4xl font-black leading-tight tracking-tight">
                  Products
                </p>
                {user && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Logged in as: <strong>{user.email}</strong> ({user.role})
                  </p>
                )}
              </div>
              <Badge className="flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/50 hover:bg-green-100 px-3 py-1 text-green-700 dark:text-green-300">
                <CloudCheck size={16} />
                {fromCache ? "Cache data" : "Data from the database"}
              </Badge>
            </div>

            {!empty && (
              <Card className="p-0 border border-[#DEE2E6] dark:border-gray-700 bg-transparent rounded-lg mb-8">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>In Stock</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="text-[#333] dark:text-white">
                          {product.product_name}
                        </TableCell>
                        <TableCell className="text-[#6c757d] dark:text-gray-400">
                          ${product.price}
                        </TableCell>
                        <TableCell className="text-[#6c757d] dark:text-gray-400">
                          {product.in_stock > 0 ? "Yes" : "No"}
                        </TableCell>
                        <TableCell>
                          {product.status === "Active" ? (
                            <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                              {product.status}
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                              {product.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user?.role === "ADMIN" && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Pencil size={14} />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 p-2"
                                  onClick={() =>
                                    handleDeleteProduct(product.id!)
                                  }
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </>
                            )}
                            <Button className="flex items-center gap-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 font-bold px-4 h-8">
                              <Eye size={14} />
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}

            {!empty && user?.role === "ADMIN" && (
              <div className="mt-12">
                <p className="text-xl font-bold text-[#333] dark:text-white mb-4">
                  User View
                </p>
                <Card className="p-0 border border-[#DEE2E6] dark:border-gray-700 bg-transparent rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell>Product Name</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>In Stock</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="text-[#333] dark:text-white">
                            {product.product_name}
                          </TableCell>
                          <TableCell className="text-[#6c757d] dark:text-gray-400">
                            ${product.price}
                          </TableCell>
                          <TableCell className="text-[#6c757d] dark:text-gray-400">
                            {product.in_stock > 0 ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button className="flex items-center gap-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 font-bold px-4 h-8">
                              <Eye size={14} />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {empty && (
              <div className="flex flex-col px-4 py-16">
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center justify-center size-20 rounded-full bg-background-light dark:bg-background-dark text-primary">
                    <Package size={40} />
                  </div>
                  <div className="flex max-w-[480px] flex-col items-center gap-2">
                    <p className="text-[#333] dark:text-white text-lg font-bold leading-tight text-center">
                      No Products Found
                    </p>
                    <p className="text-[#6c757d] dark:text-gray-400 text-sm max-w-[480px] text-center">
                      Get started by adding a new product.
                    </p>
                  </div>
                  {user?.role === "ADMIN" && (
                    <Button
                      className="min-w-[84px] max-w-[480px] bg-primary text-white hover:bg-primary/90 font-bold"
                      onClick={handleAddProduct}
                    >
                      Add Product
                    </Button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
