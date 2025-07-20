// contexts/PurchaseContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const PurchaseContext = createContext();

export const usePurchase = () => useContext(PurchaseContext);

export const PurchaseProvider = ({ children }) => {
  const [itemsToPurchase, setItemsToPurchase] = useState([]);

  // Khi user logout hoặc thay đổi role → reset
  useEffect(() => {
    return () => {
      setItemsToPurchase([]); // reset khi unmount
    };
  }, []);

  return (
    <PurchaseContext.Provider value={{ itemsToPurchase, setItemsToPurchase }}>
      {children}
    </PurchaseContext.Provider>
  );
};
