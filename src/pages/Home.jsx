import { useEffect, useState } from "react";
import API from "../services/api";
import SideBar from "../components/SideBar";
import HeroBanner from "../components/HeroBanner";
import BrandCarousel from "../components/BrandCarousel";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    API.get("products/")
      .then(res => {
        // Your Django API returns a list of products
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          console.error("Expected an array but got:", res.data);
          setProducts([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      });
  }, []);

  const handleAddToCart = (productId) => {
    API.post("cart/add/", { product_id: productId, quantity: 1 })
      .then(res => {
        alert("Product added to cart!");
        console.log("Cart:", res.data);
      })
      .catch(err => console.error("Error adding to cart:", err));
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <SideBar />
      <main className="flex-1 p-6">
        <HeroBanner />
        <BrandCarousel />

        <div className="grid grid-cols-4 gap-4 mt-6">
          {products.length === 0 ? (
            <p className="col-span-4 text-center text-gray-500">
              No products found.
            </p>
          ) : (
            products.map(p => (
              <div
                key={p.id}
                className="bg-white p-4 rounded-md shadow-sm hover:shadow-md transition"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-40 w-full object-cover rounded"
                />
                <h3 className="mt-2 font-semibold">{p.name}</h3>
                <p className="text-gray-600">R{Number(p.price).toFixed(2)}</p>

                <button
              onClick={() => handleAddToCart(p.id)}
              className="mt-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Add to Cart
            </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}



// import { useEffect, useState } from "react";
// import API from "../services/api";
// import SideBar from "../components/SideBar";
// import HeroBanner from "../components/HeroBanner";
// import BrandCarousel from "../components/BrandCarousel";


// export default function Home() {
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     API.get("products/")
//       .then(res => {
//         const data = res.data;
  
//         // Handle both paginated and non-paginated responses
//         if (data && Array.isArray(data.results)) {
//           setProducts(data.results);
//         } else if (Array.isArray(data)) {
//           setProducts(data);
//         } else {
//           console.error("Unexpected API response:", data);
//           setProducts([]);
//         }
//       })
//       .catch(err => {
//         console.error("Failed to fetch products:", err);
//         setProducts([]);
//       });
//   }, []);
  
  
// //   useEffect(() => {
// //   API.get("products/")
// //     .then(res => {
// //       // If your API returns paginated data
// //       if (Array.isArray(res.data.results)) {
// //         setProducts(res.data.results);
// //       } else if (Array.isArray(res.data)) {
// //         // If your API directly returns a list
// //         setProducts(res.data);
// //       } else {
// //         console.error("Unexpected data structure:", res.data);
// //       }
// //     })
// //     .catch(err => console.error("Failed to fetch products:", err));
// // }, []);


//   return (
//     <div className="flex bg-gray-100">
//       <SideBar />
//       <main className="flex-1 p-6">
//         <HeroBanner />
//         <BrandCarousel />
//         <div className="grid grid-cols-4 gap-4 mt-6">
//           {products.map(p => (
//             <div key={p.id} className="bg-white p-4 rounded-md shadow-sm">
//               <img src={p.image} alt={p.name} className="h-40 w-full object-cover rounded" />
//               <h3 className="mt-2 font-semibold">{p.title}</h3>
//               <p className="text-gray-600">R{p.price}</p>
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }
