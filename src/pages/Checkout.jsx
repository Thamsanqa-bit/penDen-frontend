import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Trash2, Minus, Plus } from "lucide-react";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    return state?.cart || JSON.parse(localStorage.getItem("cart")) || {};
  });

  const [products, setProducts] = useState(() => {
    return state?.products || JSON.parse(localStorage.getItem("products")) || [];
  });

  const [orderedItems, setOrderedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState({});

  // Sync storage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("products", JSON.stringify(products));
  }, [cart, products]);

  // Compute totals
  useEffect(() => {
    const items = products.filter((p) => cart[p.id]);
    setOrderedItems(items);

    const totalAmount = items.reduce(
      (sum, p) => sum + Number(p.price) * cart[p.id],
      0
    );

    setTotal(totalAmount);
  }, [cart, products]);

  // Remove item completely from cart
  const handleRemoveItem = async (productId) => {
    setLoading(prev => ({ ...prev, [productId]: 'remove' }));
    
    try {
      await API.post("cart/remove/", { 
        product_id: productId, 
        quantity: cart[productId] // Remove all quantity at once
      });

      setCart(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });

      setMessage("Item removed from cart");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Remove item error:", error);
      setMessage("Failed to remove item from cart");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Decrease quantity by 1
  const handleDecreaseQuantity = async (productId) => {
    if (cart[productId] <= 1) {
      // If quantity is 1, remove the item completely
      handleRemoveItem(productId);
      return;
    }

    setLoading(prev => ({ ...prev, [productId]: 'decrease' }));
    
    try {
      await API.post("cart/remove/", { 
        product_id: productId, 
        quantity: 1 
      });

      setCart(prev => ({
        ...prev,
        [productId]: prev[productId] - 1
      }));

      setMessage("Quantity decreased");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Decrease quantity error:", error);
      setMessage("Failed to update quantity");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Increase quantity by 1
  const handleIncreaseQuantity = async (productId) => {
    setLoading(prev => ({ ...prev, [productId]: 'increase' }));
    
    try {
      await API.post("cart/add/", { 
        product_id: productId, 
        quantity: 1 
      });

      setCart(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1
      }));

      setMessage("Quantity increased");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Increase quantity error:", error);
      setMessage("Failed to update quantity");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (Object.keys(cart).length === 0) return;

    setLoading(prev => ({ ...prev, clear: true }));
    
    try {
      // Remove all items one by one from backend
      const removePromises = Object.keys(cart).map(productId =>
        API.post("cart/remove/", { 
          product_id: productId, 
          quantity: cart[productId] 
        })
      );

      await Promise.all(removePromises);

      setCart({});
      setMessage("Cart cleared successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Clear cart error:", error);
      setMessage("Failed to clear cart");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, clear: false }));
    }
  };

  const payWithPayFast = async () => {
    if (total <= 0) {
      setMessage("Your cart is empty.");
      return;
    }
  
    try {
      setMessage("Redirecting to secure payment...");
  
      // Call Django endpoint
      const response = await API.get(`/create-payment/?amount=${total}`);
  
      const paymentUrl = response.data.payment_url;
  
      if (!paymentUrl) {
        setMessage("Payment error. Try again.");
        return;
      }
  
      // Redirect to PayFast
      window.location.href = paymentUrl;
  
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("Failed to start payment. Try again.");
    }
  };
  

  const handlePaymentSuccess = async (response) => {
    setMessage("Payment successful! Saving order...");

    try {
      const payload = {
        items: orderedItems.map((item) => ({
          product_id: item.id,
          quantity: cart[item.id],
        })),
        total,
        payment_reference: response.reference,
        address: "Default address",
      };

      await API.post("checkout/", payload);

      setMessage("✅ Order completed successfully!");

      localStorage.removeItem("cart");
      localStorage.removeItem("products");

      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error(error);
      setMessage("Payment succeeded but order saving failed.");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-[#969195]">
          Checkout Summary
        </h2>
        
        {orderedItems.length > 0 && (
          <button
            onClick={handleClearCart}
            disabled={loading.clear}
            className="flex items-center gap-2 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.clear ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Trash2 size={16} />
            )}
            Clear Cart
          </button>
        )}
      </div>

      {orderedItems.length === 0 ? (
        <div className="bg-white p-8 rounded shadow-md border border-[#d1d0cf] text-center">
          <div className="text-gray-400 mb-4">
            <Trash2 size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#969195] text-white py-2 px-6 rounded hover:bg-[#7a7774] transition"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow-md border border-[#d1d0cf]">
          {orderedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-[#e4e3e3] py-4 last:border-b-0"
            >
              <div className="flex items-center space-x-3 md:space-x-4 flex-1">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 md:w-16 md:h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold text-[#4f4e4c]">{item.name}</p>
                  <p className="text-gray-600 text-sm">
                    R{Number(item.price).toFixed(2)} each
                  </p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-3 mr-4">
                <button
                  onClick={() => handleDecreaseQuantity(item.id)}
                  disabled={loading[item.id]}
                  className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading[item.id] === 'decrease' ? (
                    <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Minus size={14} />
                  )}
                </button>

                <span className="font-semibold min-w-8 text-center">
                  {cart[item.id]}
                </span>

                <button
                  onClick={() => handleIncreaseQuantity(item.id)}
                  disabled={loading[item.id]}
                  className="flex items-center justify-center w-8 h-8 bg-[#969195] text-white rounded hover:bg-[#7a7774] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading[item.id] === 'increase' ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Plus size={14} />
                  )}
                </button>
              </div>

              {/* Item Total and Remove Button */}
              <div className="flex items-center space-x-4">
                <p className="font-semibold text-sm md:text-base text-[#969195] min-w-20 text-right">
                  R{(Number(item.price) * cart[item.id]).toFixed(2)}
                </p>
                
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={loading[item.id]}
                  className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove item"
                >
                  {loading[item.id] === 'remove' ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Total and Messages */}
          <div className="mt-6 pt-4 border-t border-[#e4e3e3]">
            {message && (
              <div
                className={`mb-4 p-3 rounded text-center ${
                  message.startsWith("✅")
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : message.includes("Failed")
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-bold text-[#969195]">
                  Total: R{total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {orderedItems.length} item{orderedItems.length !== 1 ? 's' : ''} in cart
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="bg-gray-500 text-white py-3 px-6 rounded hover:bg-gray-600 transition"
              >
                Continue Shopping
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="bg-[#b3b1ae] text-white py-3 px-6 rounded hover:bg-[#8d8a87] transition"
              >
                Back to Cart
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={payWithPayFast}
                className="bg-[#969195] text-white py-3 px-6 rounded hover:bg-[#7a7774] transition"
              >
                Pay Now (Visa)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}