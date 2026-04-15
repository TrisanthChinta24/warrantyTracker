import { createContext, useContext, useMemo, useState } from "react";
import ToastStack from "../components/common/ToastStack";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = (message, type = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const value = useMemo(() => ({ pushToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
