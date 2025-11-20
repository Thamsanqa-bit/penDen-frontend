import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    return state?.cart || JSON.parse(localStorage.getItem("cart")) || {};
  });

  const [products, setProducts] = useState(() => {
    return state?.products || JSON.parse(localStorage.getItem("products")) || [];
  });

  const [orderedItems, setOrderedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Sync cart + products to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("products", JSON.stringify(products));
  }, [cart, products]);

  // Calculate ordered items + total
  useEffect(() => {
    const items = products.filter((p) => cart[p.id]);
    setOrderedItems(items);

    const totalAmount = items.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * cart[p.id],
      0
    );

    setTotal(totalAmount);
  }, [cart, products]);

  // ------------------------------
  // PAYSTACK INLINE PAYMENT
  // ------------------------------
  const payWithPaystack = () => {
    if (total <= 0) {
      setMessage("Your cart is empty.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: "YOUR_PAYSTACK_PUBLIC_KEY", 
      email: "customer@example.com",
      amount: total * 100,
      currency: "ZAR",
      callback: function (response) {
        handlePaymentSuccess(response);
      },
      onClose: function () {
        setMessage("Payment popup closed.");
      },
    });

    handler.openIframe();
  };

  const handlePaymentSuccess = async (response) => {
    setMessage("Payment successful! Saving order...");

    try {
      const payload = {
        items: orderedItems.map((item) => ({
          product_id: item.id,
          quantity: cart[item.id],
        })),
        total,
        payment_reference: response.reference,
        address: "Default address",
      };

      await API.post("checkout/", payload);

      setMessage("✅ Order completed successfully!");

      localStorage.removeItem("cart");
      localStorage.removeItem("products");

      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error(error);
      setMessage("Payment succeeded but order saving failed.");
    }
  };

  // ------------------------------

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Checkout Summary</h2>

      {orderedItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="bg-white p-4 rounded shadow-md">
          {orderedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b py-3"
            >
              <div className="flex items-center space-x-3 md:space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 md:w-16 md:h-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-600 text-sm">
                    Qty: {cart[item.id]} × R{Number(item.price).toFixed(2)}
                  </p>
                </div>
              </div>

              <p className="font-semibold text-sm md:text-base">
                R{(Number(item.price) * cart[item.id]).toFixed(2)}
              </p>
            </div>
          ))}

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

          {/* Back + Confirm Order */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
            >
              Back
            </button>

            <button
              onClick={() => setMessage("Order will be placed after payment.")}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Confirm Order
            </button>
          </div>

          {/* PAYSTACK BUTTON - Bottom Left + Mobile friendly */}
          <div className="mt-6 flex justify-start">
            <button
              onClick={payWithPaystack}
              className="w-full md:w-auto bg-green-600 text-white py-3 px-6 rounded hover:bg-blue-700"
            >
              Pay Now (Mastercard / Visa)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import API from "../services/api";

// export default function Checkout() {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   // ✅ Restore from state or localStorage
//   const [cart, setCart] = useState(() => {
//     return state?.cart || JSON.parse(localStorage.getItem("cart")) || {};
//   });
//   const [products, setProducts] = useState(() => {
//     return state?.products || JSON.parse(localStorage.getItem("products")) || [];
//   });

//   const [orderedItems, setOrderedItems] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     // Always sync to localStorage for persistence
//     localStorage.setItem("cart", JSON.stringify(cart));
//     localStorage.setItem("products", JSON.stringify(products));
//   }, [cart, products]);

//   // Compute ordered items & total
//   useEffect(() => {
//     const items = products.filter((p) => cart[p.id]);
//     setOrderedItems(items);

//     const totalAmt = items.reduce(
//       (sum, p) => sum + (Number(p.price) || 0) * cart[p.id],
//       0
//     );
//     setTotal(totalAmt);
//   }, [cart, products]);

//   const handleConfirmOrder = async () => {
//     if (orderedItems.length === 0) {
//       setMessage("Your cart is empty.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         items: orderedItems.map((item) => ({
//           product_id: item.id,
//           quantity: cart[item.id],
//         })),
//         total,
//         address: "Default address",
//       };

//       await API.post("checkout/", payload);
//       setMessage("✅ Order placed successfully!");
//       localStorage.removeItem("cart");
//       localStorage.removeItem("products");
//       setTimeout(() => navigate("/"), 1500);
//     } catch (error) {
//       console.error(error);
//       setMessage("Failed to place order. Please log in first.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h2 className="text-2xl font-bold mb-4">Checkout Summary</h2>

//       {orderedItems.length === 0 ? (
//         <p>Your cart is empty.</p>
//       ) : (
//         <div className="bg-white p-4 rounded shadow-md">
//           {orderedItems.map((item) => (
//             <div
//               key={item.id}
//               className="flex items-center justify-between border-b py-3"
//             >
//               <div className="flex items-center space-x-4">
//                 <img
//                   src={item.image}
//                   alt={item.name}
//                   className="w-16 h-16 object-cover rounded"
//                 />
//                 <div>
//                   <p className="font-semibold">{item.name}</p>
//                   <p className="text-gray-600">
//                     Qty: {cart[item.id]} × R{Number(item.price).toFixed(2)}
//                   </p>
//                 </div>
//               </div>
//               <p className="font-semibold">
//                 R{(Number(item.price) * cart[item.id]).toFixed(2)}
//               </p>
//             </div>
//           ))}

//           <div className="text-right mt-4">
//             <p className="text-lg font-bold">Total: R{total.toFixed(2)}</p>
//           </div>

//           {message && (
//             <div
//               className={`mt-4 p-2 rounded text-center ${
//                 message.startsWith("✅")
//                   ? "bg-green-100 text-green-700"
//                   : "bg-red-100 text-red-700"
//               }`}
//             >
//               {message}
//             </div>
//           )}

//           <div className="flex justify-end mt-6 space-x-3">
//             <button
//               onClick={() => navigate(-1)}
//               className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
//             >
//               Back
//             </button>
//             <button
//               onClick={handleConfirmOrder}
//               disabled={loading}
//               className={`${
//                 loading
//                   ? "bg-green-400 cursor-not-allowed"
//                   : "bg-green-600 hover:bg-green-700"
//               } text-white py-2 px-4 rounded`}
//             >
//               {loading ? "Processing..." : "Confirm Order"}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



