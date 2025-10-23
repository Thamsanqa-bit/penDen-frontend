import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [cart, setCart] = useState(state?.cart || {});
  const [products, setProducts] = useState(state?.products || []);
  const [orderedItems, setOrderedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const CHECKOUT_ENDPOINT = "checkout/";
  const PRODUCTS_ENDPOINT = "products/";

  //Fetch products if none were passed from state
  useEffect(() => {
    if (!products.length) {
      API.get(PRODUCTS_ENDPOINT)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setProducts(res.data);
          } else {
            console.error("Expected an array but got:", res.data);
            setProducts([]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch products:", err);
          setProducts([]);
        });
    }
  }, [products.length]);

  //Calculate ordered items & total dynamically
  useEffect(() => {
    const items = products.filter((p) => cart[p.id]);
    setOrderedItems(items);

    const totalAmount = items.reduce((sum, p) => {
      const price = Number(p.price) || 0;
      return sum + price * cart[p.id];
    }, 0);

    setTotal(totalAmount);
  }, [products, cart]);

  //Confirm Order function
  const handleConfirmOrder = async () => {
    if (orderedItems.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        items: orderedItems.map((item) => ({
          product_id: item.id,
          quantity: cart[item.id],
        })),
        total,
        address: "Default address",
      };

      const response = await API.post(CHECKOUT_ENDPOINT, payload);
      console.log("Order placed:", response.data);

      setMessage("Order placed successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Checkout failed:", error.response?.data || error.message);
      setMessage("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Checkout Summary</h2>

      {orderedItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="bg-white p-4 rounded shadow-md">
          {orderedItems.map((item) => {
            const price = Number(item.price) || 0;
            const quantity = cart[item.id];
            const subtotal = price * quantity;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between border-b py-3"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-gray-600">
                      Quantity: {quantity} × R{price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">R{subtotal.toFixed(2)}</p>
              </div>
            );
          })}

          <div className="text-right mt-4">
            <p className="text-lg font-bold">Total: R{total.toFixed(2)}</p>
          </div>

          {message && (
            <div
              className={`mt-4 p-2 rounded text-center ${
                message.startsWith("✅")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={() => navigate(-1)}
              disabled={loading}
              className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
            >
              Back
            </button>
            <button
              onClick={handleConfirmOrder}
              disabled={loading}
              className={`${
                loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white py-2 px-4 rounded`}
            >
              {loading ? "Processing..." : "Confirm Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

