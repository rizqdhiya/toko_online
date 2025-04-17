import BannerSlider from "@/components/BannerSlider";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function Home() {
  // Contoh data produk
  const products = [
    {
      id: 1,
      name: "Kemeja Pria Lengan Panjang",
      price: "Rp 150.000",
      image: "/produk/kemeja1.jpg",
    },
    {
      id: 2,
      name: "Blouse Wanita Elegan",
      price: "Rp 120.000",
      image: "/produk/blouse1.jpg",
    },
    {
      id: 3,
      name: "Kaos Casual Unisex",
      price: "Rp 90.000",
      image: "/produk/kaos1.jpg",
    },
    {
      id: 4,
      name: "Dress Wanita Floral",
      price: "Rp 175.000",
      image: "/produk/dress1.jpg",
    },
    {
      id: 5,
      name: "Dress Wanita Floral",
      price: "Rp 175.000",
      image: "/produk/dress1.jpg",
    },
    {
      id: 6,
      name: "Dress Wanita Floral",
      price: "Rp 175.000",
      image: "/produk/dress1.jpg",
    },
    // Tambah produk lain sesuai kebutuhan
  ];

  return (
    <>
      <Navbar />
      <BannerSlider />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-gray-600 mt-1">{product.price}</p>
                <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
