import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Product, CartItem, Order, UserProfile } from '../backend';
import { getLocalCart, saveLocalCart, clearLocalCart, addToLocalCart, updateLocalCartItem, removeFromLocalCart } from '../lib/cartLocal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Product Queries
export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(productId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProduct(BigInt(productId));
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useSearchProducts(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      if (!searchTerm) return actor.getAllProducts();
      return actor.searchProducts(searchTerm);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFilterByCategory(category: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      if (!category) return actor.getAllProducts();
      return actor.filterByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

// Cart Queries
export function useGetCart() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CartItem[]>({
    queryKey: ['cart', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!identity) {
        return getLocalCart();
      }
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint }) => {
      if (!identity) {
        addToLocalCart(productId, quantity);
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint }) => {
      if (!identity) {
        updateLocalCartItem(productId, quantity);
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.updateCartItem(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!identity) {
        removeFromLocalCart(productId);
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.removeFromCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!identity) {
        clearLocalCart();
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useMergeCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (localCartItems: CartItem[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.mergeCart(localCartItems);
    },
    onSuccess: () => {
      clearLocalCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// Order Queries
export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shippingAddress, contactInfo }: { shippingAddress: string; contactInfo: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(shippingAddress, contactInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetUserOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Order[]>({
    queryKey: ['orders', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserOrders();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetOrder(orderId: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrder(BigInt(orderId));
    },
    enabled: !!actor && !isFetching && !!orderId && !!identity,
  });
}
