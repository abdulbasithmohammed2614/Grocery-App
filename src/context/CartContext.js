
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "grocery-app-cart";
export const FREE_DELIVERY_THRESHOLD = 499;
export const STANDARD_DELIVERY_FEE = 40;
export const STANDARD_HANDLING_FEE = 3;

const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Error loading cart:", error);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getInitialCart);

  // Sync across tabs / storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CART_STORAGE_KEY) {
        try {
          setCartItems(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (err) {
          console.error("Error syncing cart from storage:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [cartItems]);

  // Add product
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || product.id == null) return;

    const amount = Math.max(1, Number(quantity) || 1);

    setCartItems((items) => {
      const existing = items.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item
        );
      }

      return [
        ...items,
        {
          ...product,
          quantity: amount,
        },
      ];
    });
  }, []);

  // Increase / decrease quantity
  const updateQuantity = useCallback((productId, quantity) => {
    const amount = Number(quantity);

    if (!Number.isFinite(amount)) return;

    setCartItems((items) => {
      if (amount <= 0) {
        return items.filter(
          (item) => item.id !== productId
        );
      }

      return items.map((item) =>
        item.id === productId
          ? { ...item, quantity: amount }
          : item
      );
    });
  }, []);

  // Convenience helper: increment product quantity by 1
  const increaseQuantity = useCallback((productId) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }, []);

  // Convenience helper: decrement product quantity by 1 (removes when reaches 0)
  const decreaseQuantity = useCallback((productId) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  // Remove product
  const removeFromCart = useCallback((productId) => {
    setCartItems((items) =>
      items.filter((item) => item.id !== productId)
    );
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Total quantity
  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cartItems]
  );

  // Total price
  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.price || 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  // Synchronized fees & grand total
  const deliveryFee = useMemo(() => {
    if (cartItems.length === 0 || cartTotal >= FREE_DELIVERY_THRESHOLD) return 0;
    return STANDARD_DELIVERY_FEE;
  }, [cartItems.length, cartTotal]);

  const handlingFee = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return STANDARD_HANDLING_FEE;
  }, [cartItems.length]);

  const grandTotal = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return cartTotal + deliveryFee + handlingFee;
  }, [cartItems.length, cartTotal, deliveryFee, handlingFee]);

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      cartTotal,
      deliveryFee,
      handlingFee,
      grandTotal,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
      addToCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cartItems,
      cartCount,
      cartTotal,
      deliveryFee,
      handlingFee,
      grandTotal,
      addToCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};
