import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/AuthProvider"; // Bạn đã có AuthProvider rồi

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState(0); // Đếm số lượng item trong giỏ (dòng)

  const updateCartItems = async () => {
    if (!user) {
      setCartItems(0);
      return;
    }

    try {
      const res = await axios.get("http://localhost:9999/carts?userID=" + user.id, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.length > 0) {
        const cart = res.data[0];
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartItems(totalItems);
      } else {
        setCartItems(0);
      }
    } catch (error) {
      console.error("Lỗi khi fetch cart:", error);
      setCartItems(0);
    }
  };


  useEffect(() => {
    updateCartItems();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartItems, updateCartItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
