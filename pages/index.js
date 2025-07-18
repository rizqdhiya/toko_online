import BannerSlider from "@/components/BannerSlider";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { search, kategori } = router.query;

  useEffect(() => {
    if(!router.isReady) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (kategori) params.append('kategori', kategori);
        
        const response = await fetch(`/api/produk?${params.toString()}`);
        if (!response.ok) throw new Error('Gagal memuat produk');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [search, kategori, router.isReady]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Memuat produk...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </Layout>
    );
  }
  
  const pageTitle = kategori ? `Kategori: ${kategori}` : "Semua Produk";

  return (
    <Layout>
      {/* BannerSlider hanya tampil jika tidak sedang search atau filter kategori */}
      {!search && !kategori && <BannerSlider />}
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>
        {products.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Produk tidak ditemukan.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}