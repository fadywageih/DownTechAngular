import { Product, ProductType, DeviceCondition, AccessoryType, ProductSpecification, ProductMedia, ProductUpgrade } from './product.model';
export interface CreateProductDto {
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    basePrice: number;
    productType: ProductType;
    condition: DeviceCondition;
    allowRamUpgrade: boolean;
    allowStorageUpgrade: boolean;
    allowGpuUpgrade: boolean;
    accessoryType?: AccessoryType;
    specifications: CreateProductSpecificationDto[];
    media: CreateProductMediaDto[];
    mediaFiles?: File[]; 
}
export interface CreateProductSpecificationDto {
    keyAr: string;
    keyEn: string;
    valueAr: string;
    valueEn: string;
    isUpgradable: boolean;
}
export interface CreateProductMediaDto {
    url: string;
    mediaType: number;
    order: number;
    isMain: boolean;
}
export interface UpdateProductDto {
    id: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    basePrice: number;
    condition: DeviceCondition;
    isActive: boolean;
    allowRamUpgrade: boolean;
    allowStorageUpgrade: boolean;
    allowGpuUpgrade: boolean;
    accessoryType?: AccessoryType;
    specifications: UpdateProductSpecificationDto[];
    media: UpdateProductMediaDto[];
    mediaFiles?: File[]; 
}
export interface UpdateProductSpecificationDto {
    id?: string;
    keyAr: string;
    keyEn: string;
    valueAr: string;
    valueEn: string;
    isUpgradable: boolean;
}
export interface UpdateProductMediaDto {
    id?: string;
    url: string;
    mediaType: number;
    order: number;
    isMain: boolean;
}