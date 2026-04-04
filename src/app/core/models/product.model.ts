export interface Product {
    id: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    basePrice: number;
    productType: ProductType;
    condition: DeviceCondition;
    isActive: boolean;
    allowRamUpgrade: boolean;
    allowStorageUpgrade: boolean;
    allowGpuUpgrade: boolean;
    accessoryType?: AccessoryType;
    specifications: ProductSpecification[];
    media: ProductMedia[];
    availableUpgrades: ProductUpgrade[];
}
export enum ProductType {
    Laptop = 1,
    PC = 2,
    Accessory = 3
}
export enum DeviceCondition {
    New = 1,
    Used = 2
}
export interface ProductSpecification {
    keyAr: string;
    keyEn: string;
    valueAr: string;
    valueEn: string;
    isUpgradable: boolean;
}
export interface ProductMedia {
    url: string;
    mediaType: MediaType;
    order: number;
    isMain: boolean;
}
export enum MediaType {
    Image = 1,
    Video = 2
}
export interface ProductUpgrade {
    upgradeOptionId?: string;
    upgradeType: UpgradeType;
    nameAr: string;
    nameEn: string;
    fromValue: string;
    toValue: string;
    additionalPrice: number;
}
export enum UpgradeType {
    RAM = 1,
    Storage = 2,
    GPU = 3
}
export enum AccessoryType {
    Monitor = 1,
    Keyboard = 2,
    Mouse = 3,
    Printer = 4
}
export interface ProductFilterDto {
    searchTerm?: string;
    productType?: ProductType;
    condition?: DeviceCondition;
    accessoryType?: AccessoryType;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    allowRamUpgrade?: boolean;
    allowStorageUpgrade?: boolean;
    allowGpuUpgrade?: boolean;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}
export interface PagedResultDto<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}
export interface CalculatePriceDto {
    productId: string;
    selectedUpgrades: SelectedUpgradeDto[];
}
export interface SelectedUpgradeDto {
    upgradeOptionId?: string;
    upgradeType: UpgradeType;
    toValue: string;
}
export interface PriceCalculationResultDto {
    productId: string;
    productNameAr: string;
    productNameEn: string;
    basePrice: number;
    upgradesTotal: number;
    finalPrice: number;
    upgradeBreakdown: UpgradeBreakdownDto[];
}
export interface UpgradeBreakdownDto {
    upgradeType: UpgradeType;
    nameAr: string;
    nameEn: string;
    fromValue: string;
    toValue: string;
    additionalPrice: number;
}