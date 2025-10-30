import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Swal from "sweetalert2";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import type { ProductPayload } from "../lib/types";
import { createProduct, fetchProducts, updateProduct } from "../data/api";
import { useNavigate } from "react-router-dom";

const initialProductState: ProductPayload = {
  id: Date.now(),
  product_name: "",
  description: "",
  price: "0.00",
  in_stock: 0,
  status: "Active",
};

export default function ProductForm() {
  const { isEdit, productId } = window.history.state.usr || {};
  const [productData, setProductData] = useState<ProductPayload>(
    isEdit ? initialProductState : initialProductState
  );
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(isEdit ? true : false);

  useEffect(() => {
    async function fetchProductData(id: number) {
      try {
        const fetchedProduct = await fetchProducts();
        const product = (
          fetchedProduct as { data: { products: ProductPayload[] } }
        ).data.products.find((p) => p.id === id);
        if (product) {
          setProductData(product);
        } else {
          setAlert({
            type: "error",
            message: "Product not found.",
          });
        }
      } catch (error) {
        setAlert({
          type: "error",
          message: "Failed to fetch product data.",
        });
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isEdit && productId) {
      fetchProductData(productId);
    }
  }, [isEdit, productId]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setProductData((prevData) => {
      if (!prevData) return initialProductState;

      let updatedValue: string | number = value;

      if (name === "in_stock") {
        updatedValue = Number(value) || 0;
      }

      return {
        ...prevData,
        [name]: updatedValue,
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    Swal.fire({
      title: isEdit ? "Updating product..." : "Creating product...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      if (isEdit) {
        const updatedProduct = await updateProduct(
          productData.id!,
          productData
        );

        Swal.close();

        if (updatedProduct) {
          setAlert({
            type: "success",
            message: `Product "${updatedProduct.data.updated?.product_name}" updated successfully!`,
          });
          await new Promise((resolve) => setTimeout(resolve, 500));
          navigate("/");
        }
      } else {
        const createdProduct = await createProduct(productData);
        Swal.close();

        if (createdProduct) {
          setAlert({
            type: "success",
            message: `Product "${createdProduct.data.created?.product_name}" created successfully!`,
          });
          setProductData(initialProductState);
          await new Promise((resolve) => setTimeout(resolve, 500));
          navigate("/");
        }
      }
    } catch (error) {
      Swal.close();

      setAlert({
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  if (isEdit && isLoading) {
    return <div className="text-center p-8">Loading product details...</div>;
  }

  const handleCancel = () => {
    setProductData(isEdit ? productData : initialProductState);
    setAlert(null);
    navigate("/", { state: { reload: true } });
  };

  return (
    <div className="flex flex-col w-full max-w-3xl gap-6 mx-auto p-6">
      <Card className="shadow-xl border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isEdit ? "Edit Product" : "Add New Product"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {alert && (
            <Alert
              variant={alert.type === "success" ? "default" : "destructive"}
              className={
                alert.type === "success"
                  ? "bg-green-100 border-green-400 text-green-700"
                  : ""
              }
            >
              <AlertTitle>
                {alert.type === "success" ? "Success 🎉" : "Error ❌"}
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  name="product_name"
                  value={productData?.product_name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={productData?.description || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  name="price"
                  value={productData?.price || 0}
                  min={0}
                  step="0.01"
                  required
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  name="in_stock"
                  value={productData?.in_stock || 0}
                  min={0}
                  required
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  onValueChange={(value) => {
                    setProductData((prevData) => ({
                      ...prevData,
                      status: value,
                    }));
                  }}
                  defaultValue={productData?.status || "Active"} // Set default from state
                  value={productData?.status || "Active"}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CardFooter className="flex justify-end gap-3 pt-6 border-t mt-6 -mx-6 -mb-6 bg-gray-50 rounded-b-2xl">
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? "Update Product" : "Create Product"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
