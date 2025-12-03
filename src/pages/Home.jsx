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
    const response = await API.post("cart/add/", {
      product_id: productId,
      quantity: 1,
    });

    console.log("✅ Add to cart response:", response.data);
    
    // Check the actual response structure
    const updatedItem = response.data.item || response.data.cart_item;
    
    // Update cart state safely
    setBackendCart(prev => {
      // Ensure items is always an array
      let items = Array.isArray(prev.items) ? [...prev.items] : [];
      
      // Find index safely
      const index = items.findIndex(item => {
        if (!item) return false; // Skip undefined/null items
        
        // Check all possible structures
        return (
          item.id === updatedItem?.id ||
          item.product_id === productId ||
          item.product?.id === productId ||
          (item.product && item.product.id === productId)
        );
      });

      if (index !== -1 && updatedItem) {
        // Update existing item
        items[index] = updatedItem;
      } else if (updatedItem) {
        // Add new item
        items.push(updatedItem);
      }

      return {
        ...prev,
        items: items.filter(item => item != null), // Remove any null/undefined items
        total_items: response.data.total_items || 0,
        total_price: response.data.total_price || 0,
      };
    });

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
    const response = await API.post("cart/remove/", {
      product_id: productId,
      quantity: removeAll ? "all" : 1,
    });

    console.log("✅ Remove from cart response:", response.data);
    
    const updatedItem = response.data.item || response.data.cart_item;

    setBackendCart(prev => {
      // Start with clean array
      let items = Array.isArray(prev.items) ? [...prev.items] : [];
      
      if (removeAll || !updatedItem) {
        // Remove item entirely - filter safely
        items = items.filter(item => {
          if (!item) return false; // Remove undefined/null
          
          // Check all possible identifiers
          const hasProductId = item.product_id !== productId;
          const hasProductObject = !item.product || item.product.id !== productId;
          const isUpdatedItem = item.id !== updatedItem?.id;
          
          return hasProductId && hasProductObject && isUpdatedItem;
        });
      } else if (updatedItem) {
        // Update quantity - find and replace safely
        const index = items.findIndex(item => {
          if (!item) return false;
          return (
            item.id === updatedItem.id ||
            item.product_id === productId ||
            item.product?.id === productId
          );
        });
        
        if (index !== -1) {
          items[index] = updatedItem;
        }
      }

      return {
        ...prev,
        items: items.filter(item => item != null), // Final cleanup
        total_items: response.data.total_items || 0,
        total_price: response.data.total_price || 0,
      };
    });

    const message = removeAll ? "Item removed from cart" : "Quantity decreased";
    showMessage("success", message);

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

  // Helper function to get quantity for a specific product
  // Helper function to get quantity for a specific product
// Helper function to get quantity for a specific product
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
                : "bg-blue-600 hover:bg-blue-700"
            } text-white py-3 px-6 rounded-lg shadow-md transition duration-200`}
          >
            {loadingCheckout ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : `Proceed to Checkout (R${(backendCart.total_price || 0).toFixed(2)})`}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="p-4">
                        <div className="h-48 w-full mb-4 overflow-hidden rounded-lg">
                          <img
                            src={p.image || "/default-product.png"}
                            alt={p.name}
                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = "/default-product.png";
                            }}
                          />
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 h-14">
                          {p.name}
                        </h3>
                        
                        <p className="text-gray-800 font-bold text-xl mb-4">
                          R{Number(p.price).toFixed(2)}
                        </p>

                        <div className="flex flex-col gap-2">
                          {isInCart ? (
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                              <button
                                onClick={() => handleRemoveFromCart(p.id)}
                                disabled={isLoading}
                                className="bg-red-500 text-white w-10 h-10 rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove one"
                              >
                                {isLoading ? (
                                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <span className="text-xl">−</span>
                                )}
                              </button>
                              
                              <div className="text-center">
                                <span className="font-bold text-lg block">{qty}</span>
                                <span className="text-xs text-gray-500">in cart</span>
                              </div>
                              
                              <button
                                onClick={() => handleAddToCart(p.id)}
                                disabled={isLoading}
                                className="bg-green-500 text-white w-10 h-10 rounded-full hover:bg-green-600 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Add one more"
                              >
                                {isLoading ? (
                                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <span className="text-xl">+</span>
                                )}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(p.id)}
                              disabled={isLoading}
                              className="w-full bg-grey-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? (
                                <>
                                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Add to Cart
                                </>
                              )}
                            </button>
                          )}
                          
                          {isInCart && (
                            <button
                              onClick={() => handleRemoveFromCart(p.id, true)}
                              disabled={isLoading}
                              className="w-full text-sm text-red-600 py-2 px-4 rounded-lg border border-red-300 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Remove All
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
              <div className="flex justify-center items-center space-x-4 mt-12 py-6">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.has_previous}
                  className={`p-3 rounded-full transition ${
                    pagination.has_previous
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="text-gray-700 font-medium">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={!pagination.has_next}
                  className={`p-3 rounded-full transition ${
                    pagination.has_next
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
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