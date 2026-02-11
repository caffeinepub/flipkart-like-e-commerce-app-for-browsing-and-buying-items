import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ProfileSetupModal />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog',
  component: CatalogPage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$productId',
  component: ProductDetailsPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation/$orderId',
  component: OrderConfirmationPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrdersPage,
});

const orderDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: OrderDetailsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  catalogRoute,
  productRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  ordersRoute,
  orderDetailsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
