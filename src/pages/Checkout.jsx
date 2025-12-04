
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { Trash2, Minus, Plus } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState({});
  const [orderedItems, setOrderedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);


  // Use the cart data passed from Home page
  useEffect(() => {
    if (location.state) {
      console.log("📥 Received cart data from navigation:", location.state);
      const { items, total_price } = location.state;
      
      // Convert items array to cart object format
      const cartObj = {};
      items.forEach(item => {
        cartObj[item.product || item.product_id] = item.quantity;
      });
      
      setCart(cartObj);
      setOrderedItems(items);
      setTotal(total_price || 0);
    } else {
      // If no state passed, load from backend (for direct access to checkout)
      loadCartFromBackend();
    }
  }, [location.state]);

  /** 🔥 1. Load Cart From Backend (for direct access or refresh) */
  const loadCartFromBackend = async () => {
    try {
      const response = await API.get("cart/");
      const data = response.data;
      console.log("🔄 Loading cart from backend:", data);

      // Convert items array to cart object format
      const cartObj = {};
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach(item => {
          const productId = item.product || item.product_id;
          if (productId) {
            cartObj[productId] = item.quantity;
          }
        });
      }

      setCart(cartObj);
      setOrderedItems(data.items || []);
      setTotal(data.total || data.total_price || 0);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCart({});
      setOrderedItems([]);
      setTotal(0);
    }
  };

  /** 🔥 2. Remove Item */
  const handleRemoveItem = async (productId) => {
    setLoading((prev) => ({ ...prev, [productId]: "remove" }));

    try {
      await API.post("cart/remove/", {
        product_id: productId,
        quantity: cart[productId],
      });

      await loadCartFromBackend();
      setMessage("Item removed from cart");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to remove item");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  /** 🔥 3. Decrease Quantity */
  const handleDecreaseQuantity = async (productId) => {
    if (cart[productId] <= 1) {
      handleRemoveItem(productId);
      return;
    }

    setLoading((prev) => ({ ...prev, [productId]: "decrease" }));

    try {
      await API.post("cart/remove/", { product_id: productId, quantity: 1 });
      await loadCartFromBackend();
    } catch {
      setMessage("Failed to update quantity");
    } finally {
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  /** 🔥 4. Increase Quantity */
  const handleIncreaseQuantity = async (productId) => {
    setLoading((prev) => ({ ...prev, [productId]: "increase" }));

    try {
      await API.post("cart/add/", { product_id: productId, quantity: 1 });
      await loadCartFromBackend();
    } catch {
      setMessage("Failed to update quantity");
    } finally {
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const confirmOrder = async () => {
    setConfirmLoading(true);
    setMessage("");
  
    try {
      const payload = {
        items: orderedItems.map(item => {
          const product = getProductInfo(item);
          return {
            product_id: product.id,
            quantity: cart[product.id]
          };
        })
      };
  
      console.log("Sending order:", payload);
  
      const response = await API.post("checkout/", payload);
  
      setIsConfirmed(true);
      setMessage("Order confirmed successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Failed to confirm order");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setConfirmLoading(false);
    }
  };
  
  /** 🔥 5. PayFast Payment */
  const payWithPayFast = async () => {
    if (total <= 0 || orderedItems.length === 0) {
      setMessage("Cart is empty");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const response = await API.get(`/create-payment/?amount=${total}`);
      const paymentUrl = response.data.payment_url;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("Payment error. Try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Helper function to get product details from item
  const getProductInfo = (item) => {
    // Handle both item formats: from backend or from navigation state
    if (item.product && typeof item.product === 'object') {
      // Item from navigation state
      return {
        id: item.product.id || item.product,
        name: item.product.name || "Product",
        price: item.product.price || 0,
        image: item.product.image || "/default-product.png"
      };
    } else {
      // Item from backend API
      return {
        id: item.id,
        name: item.name || "Product",
        price: item.price || 0,
        image: item.image || "/default-product.png"
      };
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#969195]">
        Checkout Summary
      </h2>

      {message && (
        <div className={`p-3 rounded text-white text-center mb-3 ${
          message.includes("error") || message.includes("Failed") 
            ? "bg-red-500" 
            : "bg-green-500"
        }`}>
          {message}
        </div>
      )}

      {orderedItems.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center border">
          <Trash2 size={50} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>

          <button
            onClick={() => navigate("/")}
            className="bg-[#969195] text-white py-3 px-6 rounded hover:bg-[#847b80] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow border">
          {orderedItems.map((item, index) => {
            const product = getProductInfo(item);
            const quantity = cart[product.id] || item.quantity || 0;
            
            return (
              <div
                key={`${product.id}-${index}`}
                className="flex flex-col md:flex-row items-center justify-between border-b py-4 gap-4"
              >
                <div className="flex items-center gap-3 flex-1 w-full">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded object-cover"
                    onError={(e) => {
                      e.target.src = "/default-product.png";
                    }}
                  />
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-gray-600 text-sm">
                      R{Number(product.price).toFixed(2)} each
                    </p>
                    <p className="text-xs text-gray-500">Qty: {quantity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                  <button
                    onClick={() => handleDecreaseQuantity(product.id)}
                    disabled={loading[product.id]}
                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    {loading[product.id] === "decrease" ? (
                      <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Minus size={14} />
                    )}
                  </button>

                  <span className="font-bold text-lg min-w-6 text-center">
                    {quantity}
                  </span>

                  <button
                    onClick={() => handleIncreaseQuantity(product.id)}
                    disabled={loading[product.id]}
                    className="w-8 h-8 flex items-center justify-center rounded bg-[#969195] text-white hover:bg-[#847b80] transition-colors disabled:opacity-50"
                  >
                    {loading[product.id] === "increase" ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Plus size={14} />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-5">
                  <p className="font-semibold text-[#969195]">
                    R{(product.price * quantity).toFixed(2)}
                  </p>

                  <button
                    onClick={() => handleRemoveItem(product.id)}
                    disabled={loading[product.id]}
                    className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {loading[product.id] === "remove" ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-[#969195]">
                Total: R{total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {orderedItems.length} item{orderedItems.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>VAT included where applicable</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">

  <button
    onClick={() => navigate("/")}
    className="bg-gray-500 text-white py-3 px-6 rounded hover:bg-gray-600 transition-colors w-full md:w-auto"
  >
    Continue Shopping
  </button>

  <div className="flex flex-col gap-3 w-full md:w-auto">

    {/* 🔘 Confirm Order (Grey Button) */}
    <button
      onClick={confirmOrder}
      disabled={confirmLoading || orderedItems.length === 0 || isConfirmed}
      className={`py-3 px-6 rounded w-full 
        ${isConfirmed ? "bg-green-600 text-white" : "bg-gray-400 text-white"}
        ${confirmLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {confirmLoading ? "Confirming..." : isConfirmed ? "Order Confirmed ✓" : "Confirm Order"}
    </button>

    {/* 💳 Pay Now – only enabled after confirmation */}
    <button
      onClick={payWithPayFast}
      disabled={!isConfirmed}
      className="bg-[#969195] text-white py-3 px-6 rounded hover:bg-[#847b80] transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed w-full"
    >
      Pay Now (Visa/Mastercard)
    </button>

    <p className="text-xs text-gray-500 text-center">Secure payment via PayFast</p>
  </div>

</div>

        </div>
      )}
    </div>
  );
}