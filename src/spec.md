# Specification

## Summary
**Goal:** Build a Flipkart-like, responsive e-commerce app for browsing products, viewing details, adding items to a cart, and placing demo orders with Internet Identity sign-in support.

**Planned changes:**
- Create a responsive home page with navbar (logo, search, cart badge, sign-in/out), featured hero banner, and category shortcuts.
- Implement product catalog browsing with product cards (image, title, price, rating) and pagination or incremental loading.
- Add search, category filter, price range filter, and sorting; persist filter state via URL query parameters or local storage.
- Add product detail pages with image gallery, description/specs, price, rating, stock status, quantity selector, and add-to-cart.
- Build cart page with editable quantities, remove item, per-item subtotals, cart subtotal, and proceed-to-checkout (disabled when empty).
- Implement checkout flow to collect shipping/contact info, show order summary, and place an order (no real payment; clearly indicated).
- Add orders list and order details pages for signed-in users; orders persist across reloads.
- Integrate Internet Identity authentication with session-aware behavior (guest local cart, signed-in server cart/orders, merge guest cart on sign-in).
- Backend (single Motoko actor): data models and APIs for products, categories, carts, and orders; seed at least 30 sample products across categories.
- Frontend data fetching via React Query with caching plus loading/empty/error states across major screens.
- Apply a consistent warm orange/amber shopping theme (off-white backgrounds, charcoal text; avoid blue/purple).
- Add and use generated static images (logo, hero banner, empty-state illustration) from `frontend/public/assets/generated`.

**User-visible outcome:** Users can browse and search/filter products, view product details, add items to a cart, and complete a demo checkout; signed-in users can see and persist their cart and orders, while guests keep a local cart that can be merged on sign-in.
