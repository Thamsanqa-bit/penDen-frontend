import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import SideBar from "../components/SideBar";
import HeroBanner from "../components/HeroBanner";
import BrandCarousel from "../components/BrandCarousel";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" }); // ✅ Success/error messages
  const navigate = useNavigate();

  // Helper to show message and auto-hide
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  useEffect(() => {
    API.get("products/")
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
        showMessage("error", "Failed to load products. Please try again.");
        setProducts([]);
      });
  }, []);

  // 🛒 Add product to cart
  const handleAddToCart = (productId) => {
    API.post("cart/add/", { product_id: productId, quantity: 1 })
      .then(() => {
        setCart((prev) => ({
          ...prev,
          [productId]: (prev[productId] || 0) + 1,
        }));
        showMessage("success", "Product added to cart.");
      })
      .catch((err) => {
        console.error("Error adding to cart:", err);
        showMessage("error", "Could not add product to cart.");
      });
  };

  // ➖ Remove one quantity from cart
  const handleRemoveFromCart = (productId) => {
    API.post("cart/remove/", { product_id: productId, quantity: 1 })
      .then(() => {
        setCart((prev) => {
          const newQty = (prev[productId] || 1) - 1;
          if (newQty <= 0) {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
          }
          return { ...prev, [productId]: newQty };
        });
        showMessage("success", "Product removed from cart.");
      })
      .catch((err) => {
        console.error("Error removing from cart:", err);
        showMessage("error", "Could not remove product from cart.");
      });
  };

  // ✅ Proceed to Checkout
  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) {
      showMessage("error", "Your cart is empty. Add items before checkout.");
      return;
    }

    setLoadingCheckout(true);
    setTimeout(() => {
      navigate("/checkout", { state: { cart, products } });
      setLoadingCheckout(false);
    }, 500);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <SideBar />
      <main className="flex-1 p-6">
        <HeroBanner />
        <BrandCarousel />

        {/* ✅ Notification message */}
        {message.text && (
          <div
            className={`mb-4 p-3 rounded text-white text-center ${
              message.type === "success"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ✅ Proceed to Checkout button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleCheckout}
            disabled={loadingCheckout}
            className={`${
              loadingCheckout
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white py-2 px-6 rounded-lg shadow-md transition`}
          >
            {loadingCheckout ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>

        {/* 🛍️ Product Grid */}
        <div className="grid grid-cols-4 gap-4 mt-2">
          {products.length === 0 ? (
            <p className="col-span-4 text-center text-gray-500">
              No products found.
            </p>
          ) : (
            products.map((p) => {
              const quantity = cart[p.id] || 0;
              return (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-md shadow-sm hover:shadow-md transition flex flex-col"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-40 w-full object-cover rounded"
                  />
                  <h3 className="mt-2 font-semibold">{p.name}</h3>
                  <p className="text-gray-600 mb-2">
                    R{Number(p.price).toFixed(2)}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    {quantity > 0 ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRemoveFromCart(p.id)}
                          className="bg-gray-300 text-gray-800 px-2 rounded"
                        >
                          −
                        </button>
                        <span>{quantity}</span>
                        <button
                          onClick={() => handleAddToCart(p.id)}
                          className="bg-green-600 text-white px-2 rounded hover:bg-green-700 transition"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(p.id)}
                        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
