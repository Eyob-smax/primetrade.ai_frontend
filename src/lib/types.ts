export interface ReturnedProducts {
  data: {
    products: ProductPayload[];
  };
  cache: boolean;
  success: boolean;
}

export interface ProductPayload {
  id?: number;
  product_name: string;
  description: string;
  price: string;
  in_stock: number;
  status: string;
}

export interface ApiSuccess {
  message: string;
  success: boolean;
  data: {
    created?: ProductPayload;
    updated?: ProductPayload;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

export type ApiResponse = ApiSuccess;

export interface Created {
  data: {
    created: ProductPayload;
  };
}

export interface Updated {
  data: {
    updated: ProductPayload;
  };
}
