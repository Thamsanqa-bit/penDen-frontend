import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Trash2, Minus, Plus } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState({});

  /** 🔥 Load Cart From Backend */
  const loadCart = async () => {
    try {
      const response = await API.get("cart/");
      const data = response.data;

      setItems(data.items || []);
      setTotal(data.total_price || 0);
    } catch (error) {
      console.log("Cart error:", error);
      setItems([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  /** 🔥 Remove Item */
  const handleRemoveItem = async (productId) => {
    setLoading((prev) => ({ ...prev, [productId]: "remove" }));

    try {
      await API.post("cart/remove/", {
        product_id: productId,
        quantity: 9999, // remove all
      });

      await loadCart();
      setMessage("Item removed from cart");
    } catch (error) {
      setMessage("Failed to remove item");
    } finally {
      setTimeout(() => setMessage(""), 2000);
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  /** 🔥 Decrease Quantity */
  const handleDecreaseQuantity = async (productId, qty) => {
    if (qty <= 1) {
      handleRemoveItem(productId);
      return;
    }

    setLoading((prev) => ({ ...prev, [productId]: "decrease" }));

    try {
      await API.post("cart/remove/", { product_id: productId, quantity: 1 });
      await loadCart();
    } catch {
      setMessage("Failed to update quantity");
    } finally {
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  /** 🔥 Increase Quantity */
  const handleIncreaseQuantity = async (productId) => {
    setLoading((prev) => ({ ...prev, [productId]: "increase" }));

    try {
      await API.post("cart/add/", { product_id: productId, quantity: 1 });
      await loadCart();
    } catch {
      setMessage("Failed to update quantity");
    } finally {
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  /** 🔥 PayFast Payment */
  const payWithPayFast = async () => {
    if (total <= 0) return;

    try {
      const response = await API.get(`/create-payment/?amount=${total}`);
      const paymentUrl = response.data.payment_url;

      if (paymentUrl) window.location.href = paymentUrl;
    } catch (error) {
      setMessage("Payment error. Try again.");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#969195]">
        Checkout Summary
      </h2>

      {/* Message */}
      {message && (
        <p className="bg-gray-700 text-white p-2 text-center rounded mb-4">
          {message}
        </p>
      )}

      {/* Empty Cart */}
      {items.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center border">
          <Trash2 size={50} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>

          <button
            onClick={() => navigate("/")}
            className="bg-[#969195] text-white py-3 px-6 rounded"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-center justify-between border-b py-4 gap-4"
            >
              {/* Image + Name */}
              <div className="flex items-center gap-3 flex-1 w-full">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded object-cover"
                />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-600 text-sm">
                    R{Number(item.price).toFixed(2)} each
                  </p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                  disabled={loading[item.id]}
                  className="w-8 h-8 flex items-center justify-center rounded bg-gray-200"
                >
                  <Minus size={14} />
                </button>

                <span className="font-bold text-lg min-w-6 text-center">
                  {item.quantity}
                </span>

                <button
                  onClick={() => handleIncreaseQuantity(item.id)}
                  disabled={loading[item.id]}
                  className="w-8 h-8 flex items-center justify-center rounded bg-[#969195] text-white"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Total + Remove */}
              <div className="flex items-center gap-5">
                <p className="font-semibold text-[#969195]">
                  R{(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="mt-4 pt-4 border-t flex justify-between">
            <p className="text-lg font-bold text-[#969195]">
              Total: R{total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">{items.length} item(s)</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 text-white py-3 px-6 rounded w-full md:w-auto"
            >
              Continue Shopping
            </button>

            <button
              onClick={payWithPayFast}
              className="bg-[#969195] text-white py-3 px-6 rounded w-full md:w-auto"
            >
              Pay Now (Visa)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
