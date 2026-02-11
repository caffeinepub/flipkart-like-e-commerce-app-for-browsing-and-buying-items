import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Char "mo:core/Char";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile
  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  // Product
  public type Product = {
    id : Nat;
    title : Text;
    description : Text;
    price : Nat;
    rating : Nat;
    category : Text;
    stock : Nat;
    imageUrls : [Text];
  };

  // Cart Item
  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  // Order
  public type Order = {
    id : Nat;
    userId : Principal;
    items : [CartItem];
    total : Nat;
    shippingAddress : Text;
    contactInfo : Text;
    status : Text;
  };

  // App state
  let products = Map.empty<Nat, Product>();
  let userCarts = Map.empty<Principal, List.List<CartItem>>();
  let orders = Map.empty<Nat, Order>();
  let categoryMap = Map.empty<Text, List.List<Nat>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextProductId = 1;
  var nextOrderId = 1;

  module Product {
    public func compareByPrice(a : Product, b : Product) : Order.Order {
      Nat.compare(a.price, b.price);
    };

    public func compareByTitle(a : Product, b : Product) : Order.Order {
      Text.compare(a.title, b.title);
    };
  };

  // User Profile APIs
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Catalog APIs (open to all users including guests)
  public query ({ caller }) func getAllProducts() : async [Product] {
    let productList = List.empty<Product>();
    for ((_, product) in products.entries()) {
      productList.add(product);
    };
    productList.toArray();
  };

  public query ({ caller }) func getProduct(productId : Nat) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func searchProducts(searchTerm : Text) : async [Product] {
    let filtered = products.entries().map(func(kv) { kv.1 }).filter(
      func(product) {
        product.title.toLower().contains(#text (searchTerm.toLower()));
      }
    ).toList<Product>();
    filtered.toArray();
  };

  public query ({ caller }) func filterByCategory(category : Text) : async [Product] {
    switch (categoryMap.get(category)) {
      case (null) { [] };
      case (?productIds) {
        let productList = List.empty<Product>();
        for (productId in productIds.values()) {
          switch (products.get(productId)) {
            case (null) {};
            case (?product) { productList.add(product) };
          };
        };
        productList.toArray();
      };
    };
  };

  public query ({ caller }) func sortProductsByPrice(ascending : Bool) : async [Product] {
    let productList = List.empty<Product>();
    for ((_, product) in products.entries()) {
      productList.add(product);
    };
    let array = productList.toArray();
    if (ascending) {
      array.sort(Product.compareByPrice);
    } else {
      array.sort(Product.compareByPrice).reverse();
    };
  };

  // Cart APIs (require authenticated user)
  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access server-backed cart");
    };
    switch (userCarts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add to server-backed cart");
    };
    if (quantity == 0) { Runtime.trap("Quantity must be 1 or greater") };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (_) {
        let currentCart = switch (userCarts.get(caller)) {
          case (null) { List.empty<CartItem>() };
          case (?cart) { cart };
        };
        let newItem = { productId; quantity };
        currentCart.add(newItem);
        userCarts.add(caller, currentCart);
      };
    };
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update cart");
    };
    let currentCart = switch (userCarts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    let updatedItems = currentCart.filter(
      func(item) { quantity == 0 or item.productId != productId }
    );

    if (quantity > 0) {
      updatedItems.add({ productId; quantity });
    };

    userCarts.add(caller, updatedItems);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can modify cart");
    };
    let currentCart = switch (userCarts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    let updatedItems = currentCart.filter(
      func(item) { item.productId != productId }
    );

    userCarts.add(caller, updatedItems);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can clear cart");
    };
    userCarts.remove(caller);
  };

  public shared ({ caller }) func mergeCart(localCartItems : [CartItem]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can merge cart");
    };
    let currentCart = switch (userCarts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?cart) { cart };
    };

    for (localItem in localCartItems.vals()) {
      currentCart.add(localItem);
    };

    userCarts.add(caller, currentCart);
  };

  // Order APIs (require authenticated user)
  public shared ({ caller }) func placeOrder(shippingAddress : Text, contactInfo : Text) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };
    let cart = switch (userCarts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    if (cart.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    var total = 0;
    for (item in cart.values()) {
      switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found in cart") };
        case (?product) {
          total += product.price * item.quantity;
        };
      };
    };

    let order = {
      id = nextOrderId;
      userId = caller;
      items = cart.toArray();
      total;
      shippingAddress;
      contactInfo;
      status = "Pending";
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;
    userCarts.remove(caller);
    order;
  };

  public query ({ caller }) func getUserOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    let userOrders = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      if (order.userId == caller) {
        userOrders.add(order);
      };
    };
    userOrders.toArray();
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) {
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  // Admin APIs
  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let newProduct = {
      product with
      id = nextProductId;
    };
    products.add(nextProductId, newProduct);
    updateCategoryMap(product.category, nextProductId);
    nextProductId += 1;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, updatedProduct : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (_) {
        let newProduct = {
          updatedProduct with
          id = productId;
        };
        products.add(productId, newProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (_) {
        products.remove(productId);
      };
    };
  };

  func updateCategoryMap(category : Text, productId : Nat) {
    switch (categoryMap.get(category)) {
      case (null) {
        let newList = List.empty<Nat>();
        newList.add(productId);
        categoryMap.add(category, newList);
      };
      case (?productList) {
        productList.add(productId);
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update orders");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) {
        let updatedOrder = {
          order with
          status;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    let allOrders = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      allOrders.add(order);
    };
    allOrders.toArray();
  };

  // Initialization
  public shared ({ caller }) func initializeStore() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize the store");
    };
    // Seed sample data
    let sampleProducts = [
      {
        id = 1;
        title = "Wireless Headphones";
        description = "High-quality wireless headphones with noise cancellation";
        price = 15000;
        rating = 5;
        category = "Electronics";
        stock = 50;
        imageUrls = ["headphones1.jpg", "headphones2.jpg"];
      },
      {
        id = 2;
        title = "Smart Watch";
        description = "Feature-rich smartwatch with fitness tracking";
        price = 25000;
        rating = 4;
        category = "Electronics";
        stock = 30;
        imageUrls = ["watch1.jpg", "watch2.jpg"];
      },
      {
        id = 3;
        title = "Running Shoes";
        description = "Comfortable running shoes for all terrains";
        price = 8000;
        rating = 5;
        category = "Sports";
        stock = 100;
        imageUrls = ["shoes1.jpg", "shoes2.jpg"];
      },
    ];

    for (product in sampleProducts.vals()) {
      products.add(product.id, product);
      updateCategoryMap(product.category, product.id);
    };
    nextProductId := 4;
  };
};
