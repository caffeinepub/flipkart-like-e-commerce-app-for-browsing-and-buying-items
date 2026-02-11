import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Order {
    id: bigint;
    status: string;
    total: bigint;
    contactInfo: string;
    userId: Principal;
    shippingAddress: string;
    items: Array<CartItem>;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export interface Product {
    id: bigint;
    title: string;
    imageUrls: Array<string>;
    description: string;
    stock: bigint;
    category: string;
    rating: bigint;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    filterByCategory(category: string): Promise<Array<Product>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getOrder(orderId: bigint): Promise<Order>;
    getProduct(productId: bigint): Promise<Product>;
    getUserOrders(): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeStore(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    mergeCart(localCartItems: Array<CartItem>): Promise<void>;
    placeOrder(shippingAddress: string, contactInfo: string): Promise<Order>;
    removeFromCart(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    sortProductsByPrice(ascending: boolean): Promise<Array<Product>>;
    updateCartItem(productId: bigint, quantity: bigint): Promise<void>;
    updateOrderStatus(orderId: bigint, status: string): Promise<void>;
    updateProduct(productId: bigint, updatedProduct: Product): Promise<void>;
}
