'use client';
import React, { useEffect, useState } from "react";
import { createClient } from "@sanity/client";
import Image from "next/image";

// Sanity Client setup
const sanity = createClient({
  projectId: "6izwqnq7",
  dataset: "production",
  apiVersion: "2025-01-15",
  useCdn: true,
});

interface Product {
  _id: string;
  title: string;
  price: number;
  description: string;
  discountPercentage: number;
  imageUrl: string;
  productImage: {
    assets: {
      _ref: string;
    };
  };
  tags: string[];
}

const ProductsCards: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state

  const fetchProducts = async () => {
    try {
      const query = `*[_type == "product"]{
        _id, 
        title,
        price,
        description,
        discountPercentage,
        imageUrl: productImage.asset->url,
        tags 
      }`;
      const data = await sanity.fetch(query);
      setProducts(data);
      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Error Fetching Products:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prevCart) => [...prevCart, product]);
    alert(`${product.title} added to cart`);
  };

  const truncateDescription = (description: string, maxLength = 100) => {
    return description.length > maxLength
      ? description.substring(0, maxLength) + "..."
      : description;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-center text-blue-700 mt-4 mb-4">
        Products From Api's Data
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <Image
              src={product.imageUrl || "/fallback-image.jpg"} // Ensure a fallback URL if image is unavailable
              alt={product.title}
              width={300}
              height={300}
              className="w-full h-48 object-cover rounded-md"
            />
            <div className="mt-4">
              <h2 className="text-lg font-semibold">{product.title}</h2>
              <p className="text-black mt-2 text-sm">
                {truncateDescription(product.description)}
              </p>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-black font-bold">{product.price}</p>
                  {product.discountPercentage > 0 && (
                    <p className="text-sm text-green-400">
                      {product.discountPercentage}% off
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-slate-400 text-black rounded-full px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-slate-100 p-6 rounded-lg shadow-md">
        <h2 className="text-lg text-center mb-10 font-black text-red-900">Cart Summary</h2>
        {cart.length > 0 ? (
          <ul className="space-y-4">
            {cart.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-blue-600">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <Image
                  src={item.imageUrl || "/fallback-image.jpg"}
                  alt={item.title}
                  width={50}
                  height={50}
                  className="rounded-md"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-black text-center">Your cart is empty, please add products</p>
        )}
      </div>
    </div>
  );
};

export default ProductsCards;
