import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import SideBar from "../components/SideBar";
import HeroBanner from "../components/HeroBanner";
import BrandCarousel from "../components/BrandCarousel";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : {};
  });
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_products: 0,
    has_next: false,
    has_previous: false,
    next_page: null,
    previous_page: null,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const fetchProducts = (page = 1) => {
    setLoading(true);
    API.get(`products/?page=${page}&page_size=12`)
      .then((res) => {
        setProducts(res.data.products || []);
        setPagination(res.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_products: 0,
          has_next: false,
          has_previous: false,
        });
      })
      .catch(() => {
        showMessage("error", "Failed to load products.");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  // 🔁 Save cart & products persistently
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const handleAddToCart = (productId) => {
    API.post("cart/add/", { product_id: productId, quantity: 1 })
      .then(() => {
        setCart((prev) => ({
          ...prev,
          [productId]: (prev[productId] || 0) + 1,
        }));
        showMessage("success", "Product added to cart.");
      })
      .catch(() => showMessage("error", "Could not add product to cart."));
  };

  const handleRemoveFromCart = (productId) => {
    API.post("cart/remove/", { product_id: productId, quantity: 1 })
      .then(() => {
        setCart((prev) => {
          const updated = { ...prev };
          if (updated[productId] > 1) updated[productId]--;
          else delete updated[productId];
          return updated;
        });
        showMessage("success", "Product removed from cart.");
      })
      .catch(() => showMessage("error", "Could not remove product from cart."));
  };

  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) {
      showMessage("error", "Your cart is empty.");
      return;
    }

    setLoadingCheckout(true);
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("products", JSON.stringify(products));

    setTimeout(() => {
      navigate("/checkout", { state: { cart, products } });
      setLoadingCheckout(false);
    }, 400);
  };

  const handleNextPage = () => {
    if (pagination.has_next) {
      fetchProducts(pagination.next_page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (pagination.has_previous) {
      fetchProducts(pagination.previous_page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen">
      <div className="hidden md:block w-64">
        <SideBar />
      </div>

      <main className="flex-1 p-4 sm:p-6">
        <HeroBanner />
        <BrandCarousel />

        {message.text && (
          <div
            className={`p-3 rounded text-white text-center ${
              message.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing {products.length} of {pagination.total_products} products
          </div>
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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 py-8">
                  No products found.
                </p>
              ) : (
                products.map((p) => {
                  const qty = cart[p.id] || 0;
                  return (
                    <div
                      key={p.id}
                      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition flex flex-col"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-48 w-full object-cover rounded"
                      />
                      <h3 className="mt-2 font-semibold">{p.name}</h3>
                      <p className="text-gray-600 mb-2">R{Number(p.price).toFixed(2)}</p>

                      {qty > 0 ? (
                        <div className="flex items-center justify-between mt-auto">
                          <button
                            onClick={() => handleRemoveFromCart(p.id)}
                            className="bg-gray-300 px-3 rounded"
                          >
                            −
                          </button>
                          <span>{qty}</span>
                          <button
                            onClick={() => handleAddToCart(p.id)}
                            className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(p.id)}
                          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-auto"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {/* Simple Arrow Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8 py-4">
          <button
            onClick={handlePreviousPage}
            disabled={!pagination.has_previous}
            className={`p-3 rounded-full ${
              pagination.has_previous
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-300 text-gray-400 cursor-not-allowed"
            } transition`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

    <button
      onClick={handleNextPage}
      disabled={!pagination.has_next}
      className={`p-3 rounded-full ${
        pagination.has_next
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-gray-300 text-gray-400 cursor-not-allowed"
      } transition`}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
)}
          </>
        )}
      </main>
    </div>
  );
}