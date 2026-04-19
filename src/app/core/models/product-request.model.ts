export interface CreateProductRequestDto {
  userId?: number;
  productId: string;
  phone: string;
  details: string;
}

export interface ProductRequestDto {
  id: number;
  userId?: number;
  userName?: string;
  productId: string;
  productNameAr: string;
  productNameEn: string;
  phone: string;
  status: string;
  details: string;
  createdAt: string;
}

