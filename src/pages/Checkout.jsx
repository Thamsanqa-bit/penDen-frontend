import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { Trash2, Minus, Plus, MapPin, User, CreditCard, ShoppingBag, ArrowLeft, CheckCircle, Truck } from "lucide-react";

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
    email: "",
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
  if (!validateAddress()) {
    setTimeout(() => setMessage(""), 3000);
    return;
  }

  setConfirmLoading(true);
  setMessage("");

  try {
    const payload = {
      full_name: address.full_name,
      phone: address.phone,
      email: address.email || userInfo?.email || "",
      street: address.street,
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
      country: address.country,

      items: orderedItems.map(item => {
        let productId = item.product_id || item.id;

        // If item came from backend
        if (item.product && typeof item.product === "object") {
          productId = item.product.id;
        }

        return {
          product_id: productId,
          quantity: cart[productId]
        };
      })
    };

    console.log("📦 Sending checkout payload:", payload);

    const response = await API.post("checkout/", payload);

    setOrderId(response.data.id);
    setIsConfirmed(true);
    setMessage("Order confirmed successfully!");

  } catch (error) {
    console.error("Checkout error:", error.response?.data || error);
    setMessage(error.response?.data?.error || "Failed to confirm order");
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
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Shopping</span>
        </button>
        
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
            <ShoppingBag size={18} className="text-gray-600" />
            <span className="font-semibold">{orderedItems.length} item{orderedItems.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded text-white text-center mb-4 ${
          message.includes("error") || message.includes("Failed") 
            ? "bg-red-500" 
            : "bg-green-500"
        }`}>
          {message}
        </div>
      )}

      {orderedItems.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
          <ShoppingBag size={60} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#969195] text-white py-3 px-6 rounded-lg hover:bg-[#847b80] transition-colors font-medium"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mobile Layout: Cart Items at Top */}
          <div className="lg:hidden">
            {/* Cart Items Card */}
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={20} className="text-[#969195]" />
                <h3 className="font-semibold text-lg text-gray-900">Your Order</h3>
              </div>
              
              <div className="space-y-4">
                {orderedItems.map((item, index) => {
                  const product = getProductInfo(item);
                  const quantity = cart[product.id] || item.quantity || 0;
                  
                  return (
                    <div
                      key={`${product.id}-${index}`}
                      className="flex items-start gap-3 pb-4 border-b last:border-0"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.src = "/default-product.png";
                        }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              R{Number(product.price).toFixed(2)} each
                            </p>
                          </div>
                          <p className="font-semibold text-[#969195]">
                            R{(product.price * quantity).toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDecreaseQuantity(product.id)}
                              disabled={loading[product.id] || isConfirmed}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              {loading[product.id] === "decrease" ? (
                                <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Minus size={14} />
                              )}
                            </button>
                            
                            <span className="font-semibold min-w-6 text-center">
                              {quantity}
                            </span>
                            
                            <button
                              onClick={() => handleIncreaseQuantity(product.id)}
                              disabled={loading[product.id] || isConfirmed}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#969195] text-white hover:bg-[#847b80] transition-colors disabled:opacity-50"
                            >
                              {loading[product.id] === "increase" ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Plus size={14} />
                              )}
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(product.id)}
                            disabled={loading[product.id] || isConfirmed}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          >
                            {loading[product.id] === "remove" ? (
                              <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-[#969195]">R{total.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {orderedItems.length} item{orderedItems.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout: Side by Side */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {/* Left Column - Address & Form */}
            <div className="lg:col-span-2">
              {/* User Status */}
              <div className={`p-4 rounded-xl mb-6 ${isLoggedIn ? 'bg-blue-50 border border-blue-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center gap-3">
                  <User size={20} className={isLoggedIn ? "text-blue-600" : "text-yellow-600"} />
                  <div>
                    <p className={`font-medium ${isLoggedIn ? 'text-blue-700' : 'text-yellow-700'}`}>
                      {isLoggedIn ? `Welcome, ${userInfo?.email}` : 'Guest Checkout'}
                    </p>
                    <p className={`text-sm ${isLoggedIn ? 'text-blue-600' : 'text-yellow-600'}`}>
                      {isLoggedIn 
                        ? 'Your order will be linked to your account'
                        : 'Sign in for order tracking and faster checkout'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address Form */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#969195] rounded-lg">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">Shipping Address</h3>
                    <p className="text-gray-500 text-sm">Where should we deliver your order?</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={address.full_name}
                        onChange={handleAddressChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={address.phone}
                        onChange={handleAddressChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent transition-all"
                        placeholder="0712345678"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={address.street}
                        onChange={handleAddressChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent transition-all"
                        placeholder="123 Main Street, Suburb"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent transition-all"
                        placeholder="Cape Town"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Province *
                      </label>
                      <select
                        name="province"
                        value={address.province}
                        onChange={handleAddressChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent transition-all"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postal_code"
                        value={address.postal_code}
                        onChange={handleAddressChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent transition-all"
                        placeholder="8000"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={address.country}
                        onChange={handleAddressChange}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary (Desktop) */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
                <h3 className="font-bold text-xl text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  {orderedItems.map((item, index) => {
                    const product = getProductInfo(item);
                    const quantity = cart[product.id] || item.quantity || 0;
                    
                    return (
                      <div
                        key={`${product.id}-${index}`}
                        className="flex items-center gap-3 pb-4 border-b"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = "/default-product.png";
                          }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <div className="flex justify-between items-center mt-1">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDecreaseQuantity(product.id)}
                                disabled={loading[product.id] || isConfirmed}
                                className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="font-medium text-sm">{quantity}</span>
                              <button
                                onClick={() => handleIncreaseQuantity(product.id)}
                                disabled={loading[product.id] || isConfirmed}
                                className="w-6 h-6 flex items-center justify-center rounded bg-[#969195] text-white hover:bg-[#847b80] transition-colors disabled:opacity-50"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <p className="font-semibold text-[#969195]">
                              R{(product.price * quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-xl text-[#969195]">R{total.toFixed(2)}</span>
                  </div>
                  
                  {isConfirmed ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 mb-2">
                          <CheckCircle size={20} />
                          <span className="font-semibold">Order Confirmed!</span>
                        </div>
                        <p className="text-sm text-green-600">
                          Your order is ready for payment
                        </p>
                        {orderId && (
                          <p className="text-xs text-green-500 mt-1">
                            Order #{orderId}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={payWithPayFast}
                        className="w-full py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
                      >
                        <CreditCard size={22} />
                        Pay Now with PayFast
                      </button>
                      
                      <p className="text-xs text-gray-500 text-center">
                        Secure payment • Visa/Mastercard • Instant processing
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={confirmOrder}
                      disabled={confirmLoading}
                      className={`w-full py-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-3
                        ${confirmLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#969195] text-white hover:bg-[#847b80]"}
                      `}
                    >
                      {confirmLoading ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Truck size={20} />
                          Confirm Order & Shipping
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Actions Footer */}
          <div className="lg:hidden">
            {/* Shipping Address Form (Mobile) */}
            {/* Add this to your address form */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email Address *
  </label>
  <input
    type="email"
    name="email"
    value={address.email || (isLoggedIn ? userInfo?.email : "")}
    onChange={handleAddressChange}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent"
    placeholder="your@email.com"
    required={!isLoggedIn}
    disabled={isLoggedIn}
  />
</div>
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#969195] rounded-lg">
                  <MapPin size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Shipping Address</h3>
                  <p className="text-gray-500 text-sm">Delivery details</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={address.full_name}
                    onChange={handleAddressChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent"
                    placeholder="0712345678"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent"
                    placeholder="123 Main Street, Suburb"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#969195] focus:border-transparent"
                    placeholder="8000"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky bottom-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-[#969195]">R{total.toFixed(2)}</p>
                </div>
                {isConfirmed && orderId && (
                  <div className="text-right">
                    <p className="text-xs text-green-600 font-medium">Order #{orderId}</p>
                    <p className="text-xs text-green-500">Confirmed ✓</p>
                  </div>
                )}
              </div>
              
              {isConfirmed ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle size={18} />
                      <span className="font-semibold text-sm">Ready for Payment</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Your shipping details are saved securely
                    </p>
                  </div>
                  
                  <button
                    onClick={payWithPayFast}
                    className="w-full py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
                  >
                    <CreditCard size={20} />
                    Pay Now with PayFast
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Secure payment • Visa/Mastercard accepted
                  </p>
                </div>
              ) : (
                <button
                  onClick={confirmOrder}
                  disabled={confirmLoading}
                  className={`w-full py-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-3
                    ${confirmLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#969195] text-white hover:bg-[#847b80]"}
                  `}
                >
                  {confirmLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Truck size={20} />
                      Confirm Order & Shipping
                    </>
                  )}
                </button>
              )}
              
              {!isLoggedIn && !isConfirmed && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => navigate("/login", { state: { fromCheckout: true } })}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Sign in for faster checkout
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