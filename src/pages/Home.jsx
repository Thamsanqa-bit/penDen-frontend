import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import SideBar from "../components/SideBar";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [backendCart, setBackendCart] = useState({
    id: null,
    session_key: null,
    items: [],
    total_price: 0,
    total_items: 0
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
  const [cartLoading, setCartLoading] = useState({}); // Track loading per product

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch backend cart on component mount
  useEffect(() => {
    fetchBackendCart();
  }, []);

  const fetchBackendCart = async () => {
    try {
      console.log("📦 Fetching cart from backend...");
      const response = await API.get("cart/");
      console.log("✅ Backend cart response:", response.data);
      
      // DEBUG: Log cart structure
      if (response.data && response.data.items) {
        console.log("🛒 Cart items structure:", {
          length: response.data.items.length,
          firstItem: response.data.items[0],
          total_items: response.data.total_items,
          total_price: response.data.total_price
        });
      }
      
      setBackendCart({
        id: response.data.id || null,
        session_key: response.data.session_key || null,
        items: Array.isArray(response.data.items) ? response.data.items : [],
        total_price: response.data.total_price || 0,
        total_items: response.data.total_items || 0
      });
    } catch (error) {
      console.error("❌ Could not fetch cart from backend:", error);
      showMessage("error", "Failed to load cart. Please refresh the page.");
    }
  };

  const getCategoryFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("category") || "";
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    const category = getCategoryFromURL();

    let url = `products/?page=${page}&page_size=12`;
    if (category) url += `&category=${category}`;

    try {
      const response = await API.get(url);
      console.log("✅ Products response:", response.data);
      
      setProducts(response.data.products || []);
      setPagination(
        response.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_products: 0,
          has_next: false,
          has_previous: false,
        }
      );
    } catch (error) {
      console.error("❌ Failed to load products:", error);
      showMessage("error", "Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [location.search]);

  const handleAddToCart = async (productId) => {
    if (cartLoading[productId]) return;
  
    setCartLoading(prev => ({ ...prev, [productId]: true }));
  
    try {
      await API.post("cart/add/", {
        product_id: productId,
        quantity: 1,
      });
  
      // 🔥 CRITICAL FIX: fetch true backend cart after adding
      await fetchBackendCart();
  
      showMessage("success", "Item added to cart!");
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      showMessage("error", "Could not add item to cart.");
    } finally {
      setCartLoading(prev => ({ ...prev, [productId]: false }));
    }
  };
  
  

  const handleRemoveFromCart = async (productId, removeAll = false) => {
    if (cartLoading[productId]) return;
  
    setCartLoading(prev => ({ ...prev, [productId]: true }));
  
    try {
      await API.post("cart/remove/", {
        product_id: productId,
        quantity: removeAll ? "all" : 1,
      });
  
      // 🔥 CRITICAL FIX: fetch updated backend cart
      await fetchBackendCart();
  
      showMessage("success", removeAll ? "Item removed" : "Quantity decreased");
    } catch (error) {
      console.error("❌ Error removing from cart:", error);
      showMessage("error", "Could not remove item.");
    } finally {
      setCartLoading(prev => ({ ...prev, [productId]: false }));
    }
  };
  
  

  const handleCheckout = () => {
    if (backendCart.total_items === 0) {
      showMessage("error", "Your cart is empty.");
      return;
    }
  
    navigate("/checkout", {
      state: {
        cart_id: backendCart.id,
        total_items: backendCart.total_items,
        total_price: backendCart.total_price,
        items: backendCart.items,
      }
    });
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

  const getProductQuantity = (productId) => {
    console.log("🛒 getProductQuantity called for productId:", productId);
    
    if (!backendCart || !backendCart.items || !Array.isArray(backendCart.items)) {
      return 0;
    }
    
    try {
      const cartItem = backendCart.items.find(item => {
        // Skip undefined/null items
        if (!item) return false;
        
        // Check all possible structures
        return (
          (item.product_id && item.product_id === productId) ||
          (item.product && item.product.id === productId) ||
          (item.product_id === productId)
        );
      });
      
      console.log("🛒 Found cartItem for quantity:", cartItem);
      
      // Return quantity safely, default to 0
      return cartItem ? (cartItem.quantity || 0) : 0;
    } catch (error) {
      console.error("🛒 Error in getProductQuantity:", error);
      return 0;
    }
  };

  // Use backendCart.total_items directly
  const totalCartItems = backendCart.total_items || 0;
  const hasCartItems = totalCartItems > 0;

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen">
      <div className="hidden md:block w-64">
        <SideBar />
      </div>

      <main className="flex-1 p-4 sm:p-6">
        {message.text && (
          <div
            className={`p-3 rounded text-white text-center mb-3 ${
              message.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
          <div className="text-sm text-gray-600">
            Showing {products.length} of {pagination.total_products} products
            {hasCartItems && ` | ${totalCartItems} item${totalCartItems !== 1 ? 's' : ''} in cart (R${(backendCart.total_price || 0).toFixed(2)})`}
          </div>

          <button
            onClick={handleCheckout}
            disabled={loadingCheckout || !hasCartItems}
            className={`w-full sm:w-auto ${
              loadingCheckout || !hasCartItems
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-600 hover:bg-gray-700"
            } text-white py-3 px-4 sm:px-6 rounded-lg shadow-md transition duration-200 text-sm sm:text-base`}
          >
            {loadingCheckout ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : `Checkout (R${(backendCart.total_price || 0).toFixed(2)})`}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">No products found.</p>
                </div>
              ) : (
                products.map((p) => {
                  if (!p || !p.id) return null;
                  const qty = getProductQuantity(p.id);
                  const isInCart = qty > 0;
                  const isLoading = cartLoading[p.id];
                  
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                    >
                      <div className="p-3 sm:p-4 flex flex-col flex-grow">
                      <div className="w-full rounded-lg bg-white flex items-center justify-center mb-3 sm:mb-4">
                        <img
                          src={p.image || "/default-product.png"}
                          alt={p.name}
                          className="w-full h-auto max-h-48 object-contain p-1"
                          onError={(e) => {
                            e.target.src = "/default-product.png";
                          }}
                        />
                      </div>


                        
                        <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem]">
                          {p.name}
                        </h3>
                        
                        <p className="text-gray-800 font-bold text-lg sm:text-xl mb-3 sm:mb-4 flex-shrink-0">
                          R{Number(p.price).toFixed(2)}
                        </p>

                        <div className="mt-auto pt-3 sm:pt-4">
                          {isInCart ? (
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                <button
                                  onClick={() => handleRemoveFromCart(p.id)}
                                  disabled={isLoading}
                                  className="bg-gray-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Remove one"
                                  aria-label="Remove one item"
                                >
                                  {isLoading ? (
                                    <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <span className="text-lg sm:text-xl font-bold">−</span>
                                  )}
                                </button>
                                
                                <div className="text-center px-1 sm:px-2 min-w-[50px] sm:min-w-[60px]">
                                  <span className="font-bold text-base sm:text-lg block">{qty}</span>
                                  <span className="text-xs text-gray-500">in cart</span>
                                </div>
                                
                                <button
                                  onClick={() => handleAddToCart(p.id)}
                                  disabled={isLoading}
                                  className="bg-gray-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Add one more"
                                  aria-label="Add one more item"
                                >
                                  {isLoading ? (
                                    <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <span className="text-lg sm:text-xl font-bold">+</span>
                                  )}
                                </button>
                              </div>
                              
                              {/* <button
                                onClick={() => handleRemoveFromCart(p.id, true)}
                                disabled={isLoading}
                                className="w-full text-xs sm:text-sm text-red-600 py-2 px-3 sm:px-4 rounded-lg border border-red-300 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Remove All
                              </button> */}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(p.id)}
                              disabled={isLoading}
                              className="w-full bg-gray-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? (
                                <>
                                  <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  <span className="text-sm sm:text-base">Adding...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span className="text-sm sm:text-base">Add to Cart</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {pagination.total_pages > 1 && (
              <div className="flex justify-center items-center space-x-3 sm:space-x-4 mt-8 sm:mt-12 py-4 sm:py-6">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.has_previous}
                  className={`p-2 sm:p-3 rounded-full transition ${
                    pagination.has_previous
                      ? "bg-gray-600 hover:bg-gray-700 text-white shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="text-gray-700 font-medium text-sm sm:text-base">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={!pagination.has_next}
                  className={`p-2 sm:p-3 rounded-full transition ${
                    pagination.has_next
                      ? "bg-gray-600 hover:bg-gray-700 text-white shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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