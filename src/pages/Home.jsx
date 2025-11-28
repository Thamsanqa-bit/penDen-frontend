// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import SideBar from "../components/SideBar";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total_price: 0 }); // will store backend shape
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
  const location = useLocation();

  // inactivity timer (5 minutes)
  const INACTIVITY_MS = 5 * 60 * 1000;
  const inactivityTimerRef = useRef(null);

  // reset inactivity timer whenever user does something
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      // session likely expired — clear UI cart
      setCart({ items: [], total_price: 0 });
      showMessage("error", "Session expired due to inactivity. Cart cleared.");
    }, INACTIVITY_MS);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const getCategoryFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("category") || "";
  };

  const fetchProducts = (page = 1) => {
    setLoading(true);
    const category = getCategoryFromURL();

    let url = `products/?page=${page}&page_size=12`;
    if (category) url += `&category=${category}`;

    API.get(url)
      .then((res) => {
        setProducts(res.data.products || []);
        setPagination(res.data.pagination || {});
      })
      .catch(() => {
        showMessage("error", "Failed to load products.");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  // fetch server cart
  const fetchCart = () => {
    API.get("cart/")
      .then((res) => {
        setCart(res.data || { items: [], total_price: 0 });
      })
      .catch(() => {
        // if session expired, backend may return empty or 401; handle gracefully
        setCart({ items: [], total_price: 0 });
      });
  };

  // lightweight ping to keep session alive on server
  const pingSession = () => {
    API.get("cart/ping/").catch(() => {
      // ignore ping errors
    });
  };

  useEffect(() => {
    fetchProducts(1);
    fetchCart();
    resetInactivityTimer();

    // add global user interaction listeners to reset inactivity timer and ping session
    const events = ["click", "keydown", "mousemove", "touchstart"];
    const onUserAction = () => {
      resetInactivityTimer();
      pingSession();
    };

    events.forEach((e) => window.addEventListener(e, onUserAction));
    return () => {
      events.forEach((e) => window.removeEventListener(e, onUserAction));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // keep timer reset when cart changes from API
    resetInactivityTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  // add to cart calls backend and then refresh cart
  const handleAddToCart = (productId) => {
    API.post("cart/add/", { product_id: productId, quantity: 1 })
      .then(() => {
        fetchCart();
        pingSession();
        resetInactivityTimer();
        showMessage("success", "Product added to cart.");
      })
      .catch(() => showMessage("error", "Could not add product to cart."));
  };

  // remove from cart calls backend and then refresh cart
  const handleRemoveFromCart = (productId) => {
    API.post("cart/remove/", { product_id: productId, quantity: 1 })
      .then(() => {
        fetchCart();
        pingSession();
        resetInactivityTimer();
        showMessage("success", "Product removed from cart.");
      })
      .catch(() => showMessage("error", "Could not remove product from cart."));
  };

  const handleCheckout = () => {
    // fetch cart again and if not empty navigate
    setLoadingCheckout(true);
    API.get("cart/")
      .then((res) => {
        const serverCart = res.data || { items: [], total_price: 0 };
        if (!serverCart.items || serverCart.items.length === 0) {
          showMessage("error", "Your cart is empty.");
          return;
        }
        // navigate to checkout page — checkout will fetch the cart again to be safe
        navigate("/checkout");
      })
      .catch(() => {
        showMessage("error", "Failed to load cart for checkout.");
      })
      .finally(() => setLoadingCheckout(false));
  };

  const handleNextPage = () => {
    if (pagination.has_next) {
      fetchProducts(pagination.next_page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreviousPage = () => {
    if (pagination.has_previous) {
      fetchProducts(pagination.previous_page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // helper: get quantity for product id
  const getQty = (productId) => {
    const item = cart.items?.find((it) => Number(it.product.id) === Number(productId));
    return item ? item.quantity : 0;
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen">
      <div className="hidden md:block w-64">
        <SideBar />
      </div>

      <main className="flex-1 p-4 sm:p-6">
        {message.text && (
          <div
            className={`p-3 rounded text-white text-center mb-3 ${
              message.type === "success" ? "bg-[#969195]" : "bg-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
          <div className="text-sm text-gray-600">
            Showing {products.length} of {pagination.total_products || 0} products
          </div>

          <button
            onClick={handleCheckout}
            disabled={loadingCheckout}
            className={`w-full sm:w-auto ${
              loadingCheckout
                ? "bg-[#b6b3b1] cursor-not-allowed"
                : "bg-[#969195] hover:bg-[#7f7c7a]"
            } text-white py-3 px-6 rounded-lg shadow-md transition`}
          >
            {loadingCheckout ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#969195]"></div>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 py-8">
                  No products found.
                </p>
              ) : (
                products.map((p) => {
                  const qty = getQty(p.id);
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
                            className="bg-[#969195] text-white px-3 rounded hover:bg-[#7f7c7a]"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(p.id)}
                          className="bg-[#969195] text-white py-2 rounded hover:bg-[#7f7c7a] mt-auto"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {pagination.total_pages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8 py-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.has_previous}
                  className={`p-3 rounded-full ${
                    pagination.has_previous
                      ? "bg-[#969195] hover:bg-[#7f7c7a] text-white"
                      : "bg-gray-300 text-gray-400 cursor-not-allowed"
                  } transition`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={!pagination.has_next}
                  className={`p-3 rounded-full ${
                    pagination.has_next
                      ? "bg-[#969195] hover:bg-[#7f7c7a] text-white"
                      : "bg-gray-300 text-gray-400 cursor-not-allowed"
                  } transition`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor">
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
