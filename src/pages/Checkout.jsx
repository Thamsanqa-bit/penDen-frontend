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
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // 🔥 User Profile Details (MATCH DJANGO MODEL)
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
  });

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (location.state) {
      const { items, total_price } = location.state;

      const cartData = {};
      items.forEach(item => {
        cartData[item.product_id] = item.quantity;
      });

      setCart(cartData);
      setOrderedItems(items);
      setTotal(total_price);
    } else {
      loadCartFromBackend();
    }
  }, [location.state]);

  const checkUser = async () => {
    try {
      const res = await API.get("auth/user/");
      setIsLoggedIn(true);

      setProfile(prev => ({
        ...prev,
        full_name: res.data.full_name || "",
        phone: res.data.phone || "",
        email: res.data.email || "",
        address: res.data.address || "",
      }));
    } catch (e) {
      setIsLoggedIn(false);
    }
  };

  const loadCartFromBackend = async () => {
    try {
      const res = await API.get("cart/");
      const data = res.data;

      const cartData = {};
      data.items.forEach(item => {
        cartData[item.product_id] = item.quantity;
      });

      setCart(cartData);
      setOrderedItems(data.items);
      setTotal(data.total);
    } catch (e) {
      console.log("Error loading cart");
    }
  };

  const handleRemove = async (id) => {
    await API.post("cart/remove/", {
      product_id: id,
      quantity: cart[id],
    });
    loadCartFromBackend();
  };

  const decreaseQty = async (id) => {
    if (cart[id] <= 1) return handleRemove(id);

    await API.post("cart/remove/", { product_id: id, quantity: 1 });
    loadCartFromBackend();
  };

  const increaseQty = async (id) => {
    await API.post("cart/add/", { product_id: id, quantity: 1 });
    loadCartFromBackend();
  };

  // 🔥 Update input fields
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // 🔥 Confirm Order → Save to Django DB
  const confirmOrder = async () => {
    if (!profile.full_name || !profile.phone || !profile.email || !profile.address) {
      setMessage("All fields are required");
      return;
    }

    setConfirmLoading(true);

    try {
      const payload = {
        full_name: profile.full_name,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        items: orderedItems.map(item => ({
          product_id: item.product_id,
          quantity: cart[item.product_id]
        }))
      };

      const res = await API.post("checkout/", payload);

      setOrderId(res.data.order_id);
      setIsConfirmed(true);
      setMessage("Order confirmed!");
    } catch (err) {
      setMessage("Order confirmation failed");
    } finally {
      setConfirmLoading(false);
    }
  };

  // 🔥 PayFast Payment
  const payWithPayFast = async () => {
    if (!isConfirmed || !orderId) {
      setMessage("Please confirm order first");
      return;
    }

    try {
      const res = await API.post("create-payment/", {
        order_id: orderId,
        amount: total
      });

      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      }
    } catch {
      setMessage("Payment error. Try again.");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#969195]">
        Checkout
      </h2>

      {message && (
        <div className="p-3 bg-red-500 text-white rounded mb-3">{message}</div>
      )}

      {/* FORM FOR USER DETAILS */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-bold mb-3">Customer Details</h3>

        <label>Full Name *</label>
        <input
          className="w-full p-2 border rounded mb-2"
          name="full_name"
          value={profile.full_name}
          onChange={handleProfileChange}
        />

        <label>Phone *</label>
        <input
          className="w-full p-2 border rounded mb-2"
          name="phone"
          value={profile.phone}
          onChange={handleProfileChange}
        />

        <label>Email *</label>
        <input
          className="w-full p-2 border rounded mb-2"
          name="email"
          value={profile.email}
          onChange={handleProfileChange}
        />

        <label>Address *</label>
        <textarea
          className="w-full p-2 border rounded mb-2"
          name="address"
          value={profile.address}
          onChange={handleProfileChange}
        />
      </div>

      {/* CART ITEMS */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-3">Your Items</h3>

        {orderedItems.map(item => (
          <div
            key={item.product_id}
            className="flex justify-between items-center border-b py-3"
          >
            <span>{item.name}</span>

            <div className="flex items-center gap-2">
              <Minus
                className="text-red-500 cursor-pointer"
                onClick={() => decreaseQty(item.product_id)}
              />

              <span>{cart[item.product_id]}</span>

              <Plus
                className="cursor-pointer"
                onClick={() => increaseQty(item.product_id)}
              />

              <Trash2
                className="text-gray-500 cursor-pointer"
                onClick={() => handleRemove(item.product_id)}
              />
            </div>
          </div>
        ))}

        <h2 className="text-xl font-bold mt-4">Total: R {total}</h2>

        {/* CONFIRM ORDER */}
        <button
          onClick={confirmOrder}
          className="w-full bg-black text-white py-3 rounded mt-4 disabled:bg-gray-400"
          disabled={confirmLoading}
        >
          {confirmLoading ? "Processing..." : "Confirm Order"}
        </button>

        {/* PAYFAST BUTTON */}
        <button
          onClick={payWithPayFast}
          disabled={!isConfirmed}
          className={`w-full py-3 rounded mt-3 flex items-center justify-center gap-2 ${
            isConfirmed ? "bg-yellow-500 text-black" : "bg-gray-300"
          }`}
        >
          <CreditCard /> Pay with PayFast
        </button>
      </div>
    </div>
  );
}
