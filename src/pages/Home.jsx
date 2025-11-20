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
  const navigate = useNavigate();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  useEffect(() => {
    API.get("products/")
      .then((res) => {
        if (Array.isArray(res.data)) setProducts(res.data);
        else setProducts([]);
      })
      .catch(() => showMessage("error", "Failed to load products."));
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

    // ✅ Save cart & products before navigation
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("products", JSON.stringify(products));

    setTimeout(() => {
      navigate("/checkout", { state: { cart, products } });
      setLoadingCheckout(false);
    }, 400);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
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
      </main>
    </div>
  );
}


// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../services/api";
// import SideBar from "../components/SideBar";
// import HeroBanner from "../components/HeroBanner";
// import BrandCarousel from "../components/BrandCarousel";

// export default function Home() {
//   const [products, setProducts] = useState([]);
//   const [cart, setCart] = useState({});
//   const [loadingCheckout, setLoadingCheckout] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });
//   const navigate = useNavigate();

//   const showMessage = (type, text) => {
//     setMessage({ type, text });
//     setTimeout(() => setMessage({ type: "", text: "" }), 3000);
//   };

//   useEffect(() => {
//     API.get("products/")
//       .then((res) => {
//         if (Array.isArray(res.data)) {
//           setProducts(res.data);
//         } else {
//           setProducts([]);
//         }
//       })
//       .catch(() => {
//         showMessage("error", "Failed to load products. Please try again.");
//       });
//   }, []);

//   const handleAddToCart = (productId) => {
//     API.post("cart/add/", { product_id: productId, quantity: 1 })
//       .then(() => {
//         setCart((prev) => ({
//           ...prev,
//           [productId]: (prev[productId] || 0) + 1,
//         }));
//         showMessage("success", "Product added to cart.");
//       })
//       .catch(() => showMessage("error", "Could not add product to cart."));
//   };

//   const handleRemoveFromCart = (productId) => {
//     API.post("cart/remove/", { product_id: productId, quantity: 1 })
//       .then(() => {
//         setCart((prev) => {
//           const newQty = (prev[productId] || 1) - 1;
//           if (newQty <= 0) {
//             const updated = { ...prev };
//             delete updated[productId];
//             return updated;
//           }
//           return { ...prev, [productId]: newQty };
//         });
//         showMessage("success", "Product removed from cart.");
//       })
//       .catch(() => showMessage("error", "Could not remove product from cart."));
//   };

//   const handleCheckout = () => {
//     if (Object.keys(cart).length === 0) {
//       showMessage("error", "Your cart is empty. Add items before checkout.");
//       return;
//     }
//     setLoadingCheckout(true);
//     setTimeout(() => {
//       navigate("/checkout", { state: { cart, products } });
//       setLoadingCheckout(false);
//     }, 500);
//   };

//   return (
//     <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen">
//       {/* Sidebar hidden on small screens */}
//       <div className="hidden md:block w-64">
//         <SideBar />
//       </div>

//       <main className="flex-1 p-4 sm:p-6">
//         <div className="space-y-4">
//           <HeroBanner />
//           <BrandCarousel />

//           {/* Notification message */}
//           {message.text && (
//             <div
//               className={`p-3 rounded text-white text-center text-sm sm:text-base ${
//                 message.type === "success" ? "bg-green-500" : "bg-red-500"
//               }`}
//             >
//               {message.text}
//             </div>
//           )}

//           {/* Checkout button */}
//           <div className="flex justify-center sm:justify-end mb-4">
//             <button
//               onClick={handleCheckout}
//               disabled={loadingCheckout}
//               className={`w-full sm:w-auto text-center ${
//                 loadingCheckout
//                   ? "bg-green-400 cursor-not-allowed"
//                   : "bg-green-600 hover:bg-green-700"
//               } text-white py-2 px-6 rounded-lg shadow-md transition`}
//             >
//               {loadingCheckout ? "Processing..." : "Proceed to Checkout"}
//             </button>
//           </div>

//           {/* 🛍️ Product Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
//             {products.length === 0 ? (
//               <p className="col-span-full text-center text-gray-500">
//                 No products found.
//               </p>
//             ) : (
//               products.map((p) => {
//                 const quantity = cart[p.id] || 0;
//                 return (
//                   <div
//                     key={p.id}
//                     className="bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition flex flex-col"
//                   >
//                     <img
//                       src={p.image}
//                       alt={p.name}
//                       className="h-48 sm:h-40 w-full object-cover rounded"
//                     />
//                     <h3 className="mt-2 font-semibold text-sm sm:text-base truncate">
//                       {p.name}
//                     </h3>
//                     <p className="text-gray-600 mb-2 text-sm sm:text-base">
//                       R{Number(p.price).toFixed(2)}
//                     </p>
//                     <div className="flex items-center justify-between mt-auto space-x-2">
//                       {quantity > 0 ? (
//                         <div className="flex items-center space-x-2">
//                           <button
//                             onClick={() => handleRemoveFromCart(p.id)}
//                             className="bg-gray-300 text-gray-800 px-2 sm:px-3 rounded"
//                           >
//                             −
//                           </button>
//                           <span className="text-sm">{quantity}</span>
//                           <button
//                             onClick={() => handleAddToCart(p.id)}
//                             className="bg-green-600 text-white px-2 sm:px-3 rounded hover:bg-green-700 transition"
//                           >
//                             +
//                           </button>
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => handleAddToCart(p.id)}
//                           className="bg-green-600 w-full text-white py-2 rounded hover:bg-green-700 transition text-sm sm:text-base"
//                         >
//                           Add to Cart
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
