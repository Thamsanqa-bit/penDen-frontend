import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { Trash2, Minus, Plus, MapPin, User, CreditCard } from "lucide-react";

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
  const [orderId, setOrderId] = useState(null);
  
  // Address form state
  const [address, setAddress] = useState({
    full_name: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postal_code: "",
    country: "South Africa"
  });
  
  // User authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

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

  /** Check if user is authenticated */
  const checkAuthStatus = async () => {
    try {
      const response = await API.get("auth/user/");
      if (response.data && response.data.id) {
        setIsLoggedIn(true);
        setUserInfo(response.data);
        
        // Pre-fill address with user info if available
        setAddress(prev => ({
          ...prev,
          full_name: response.data.full_name || "",
          phone: response.data.phone || "",
          street: response.data.address || "",
          city: response.data.city || "",
          province: response.data.province || ""
        }));
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

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

  /** Handle address input changes */
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /** Validate address form */
  const validateAddress = () => {
    const requiredFields = ['full_name', 'phone', 'street', 'city', 'province', 'postal_code'];
    for (const field of requiredFields) {
      if (!address[field] || address[field].trim() === '') {
        setMessage(`Please fill in your ${field.replace('_', ' ')}`);
        return false;
      }
    }
    
    // Validate phone number
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(address.phone.replace(/\D/g, ''))) {
      setMessage('Please enter a valid phone number');
      return false;
    }
    
    return true;
  };

  /** 🔥 5. Confirm Order */
  const confirmOrder = async () => {
    // Validate address first
    if (!validateAddress()) {
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setConfirmLoading(true);
    setMessage("");
  
    try {
      // Format address for backend
      const formattedAddress = `
${address.full_name}
${address.phone}
${address.street}
${address.city}
${address.province}
${address.postal_code}
${address.country}
      `.trim();

      const payload = {
        items: orderedItems.map(item => {
          const product = getProductInfo(item);
          return {
            product_id: product.id,
            quantity: cart[product.id]
          };
        }),
        address: formattedAddress
      };
  
      console.log("Sending order:", payload);
  
      const response = await API.post("checkout/", payload);
      const orderData = response.data;
      
      setOrderId(orderData.id);
      setIsConfirmed(true);
      setMessage("Order confirmed successfully! You can now proceed to payment.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Order error:", error.response?.data || error);
      setMessage(error.response?.data?.error || "Failed to confirm order");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setConfirmLoading(false);
    }
  };
  
  /** 🔥 6. PayFast Payment */
const payWithPayFast = async () => {
  if (total <= 0 || orderedItems.length === 0) {
    setMessage("Cart is empty");
    setTimeout(() => setMessage(""), 3000);
    return;
  }

  if (!isConfirmed || !orderId) {
    setMessage("Please confirm your order first");
    setTimeout(() => setMessage(""), 3000);
    return;
  }

  try {
    // Try using POST method instead
    const response = await API.post("create-payment/", {
      amount: total,
      order_id: orderId
    });
    
    const paymentUrl = response.data.payment_url;

    if (paymentUrl) {
      // Redirect to PayFast
      window.location.href = paymentUrl;
    } else {
      setMessage("Payment URL not received. Please try again.");
      setTimeout(() => setMessage(""), 3000);
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
          {/* User Status Indicator */}
          <div className={`p-3 rounded mb-4 ${isLoggedIn ? 'bg-blue-50 border border-blue-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <div className="flex items-center gap-2">
              <User size={18} className={isLoggedIn ? "text-blue-600" : "text-yellow-600"} />
              <span className={`font-medium ${isLoggedIn ? 'text-blue-700' : 'text-yellow-700'}`}>
                {isLoggedIn ? `Logged in as ${userInfo?.email}` : 'Guest Checkout'}
              </span>
            </div>
            <p className={`text-sm mt-1 ${isLoggedIn ? 'text-blue-600' : 'text-yellow-600'}`}>
              {isLoggedIn 
                ? 'Your order will be linked to your account'
                : 'Your order will be processed as a guest. Sign in for order tracking.'
              }
            </p>
          </div>

          {/* Shipping Address Form */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={20} className="text-[#969195]" />
              <h3 className="font-semibold text-lg text-gray-800">Shipping Address</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={address.full_name}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#969195] focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#969195] focus:border-transparent"
                  placeholder="0712345678"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#969195] focus:border-transparent"
                  placeholder="123 Main Street, Suburb"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#969195] focus:border-transparent"
                  placeholder="Cape Town"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province *
                </label>
                <select
                  name="province"
                  value={address.province}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#969195] focus:border-transparent"
                  required
                >
                  <option value="">Select Province</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                  <option value="Western Cape">Western Cape</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={address.postal_code}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#969195] focus:border-transparent"
                  placeholder="8000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-gray-800 mb-3">Order Items</h3>
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
                      disabled={loading[product.id] || isConfirmed}
                      className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={loading[product.id] || isConfirmed}
                      className="w-8 h-8 flex items-center justify-center rounded bg-[#969195] text-white hover:bg-[#847b80] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={loading[product.id] || isConfirmed}
                      className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>

          {/* Order Summary */}
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-[#969195]">
                Total: R{total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {orderedItems.length} item{orderedItems.length !== 1 ? 's' : ''}
              </p>
              {isConfirmed && orderId && (
                <p className="text-sm text-green-600 mt-1">
                  Order #{orderId} • Ready for payment
                </p>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              <p>VAT included where applicable</p>
            </div>
          </div>

          {/* ====== FOOTER ACTIONS SECTION ====== */}
          <div className="mt-6 flex flex-col gap-4">
            {/* Continue Shopping */}
            {!isConfirmed && (
              <button
                onClick={() => navigate("/")}
                className="bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors w-full flex items-center justify-center gap-2"
              >
                Continue Shopping
              </button>
            )}

            {/* Order & Payment Buttons Container */}
            <div className="flex flex-col gap-3 w-full">
              {/* 🔘 Confirm Order */}
              {!isConfirmed ? (
                <button
                  onClick={confirmOrder}
                  disabled={confirmLoading || orderedItems.length === 0}
                  className={`py-3 rounded-lg w-full font-semibold transition-colors flex items-center justify-center gap-2
                    ${confirmLoading ? "opacity-50 cursor-not-allowed" : "bg-[#969195] text-white hover:bg-[#847b80]"}
                  `}
                >
                  {confirmLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm Order & Shipping
                    </>
                  )}
                </button>
              ) : (
                <>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Order Confirmed!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Shipping address saved. Proceed to secure payment.
                    </p>
                  </div>
                  
                  {/* 💳 PayFast Button */}
                  <button
                    onClick={payWithPayFast}
                    disabled={!isConfirmed}
                    className={`py-3 rounded-lg w-full font-semibold transition-colors flex items-center justify-center gap-2
                      bg-green-600 text-white hover:bg-green-700
                    `}
                  >
                    <CreditCard size={20} />
                    Pay Now with PayFast
                  </button>
                </>
              )}

              <p className="text-xs text-gray-500 text-center">
                Secure payment via PayFast • Visa/Mastercard
              </p>
              
              {!isLoggedIn && !isConfirmed && (
                <div className="text-center mt-2">
                  <button
                    onClick={() => navigate("/login", { state: { fromCheckout: true } })}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Sign in to save your details for faster checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}