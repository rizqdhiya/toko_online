import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data) => {
        if (!data.loggedIn) {
          router.push("/admin/login"); // Redirect ke login jika belum login
        } else {
          setIsLoggedIn(true);
        }
      });
  }, [router]);

  const menuItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Kelola Produk", href: "/admin/produk" },
    { label: "Kelola Users", href: "/admin/users" },
    { label: "Konfirmasi Pesanan", href: "/admin/orders" },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (!isLoggedIn) {
    return null; // Tidak render halaman jika belum login
  }
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-white w-64 flex-shrink-0 h-screen overflow-y-auto border-r border-gray-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
          <nav className="mt-8">
            <ul className="space-y-3">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <button onClick={handleLogout} className="w-full mt-4 py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded-md">Logout</button>
        </div>
      </aside>      
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
        <p>Selamat datang di panel admin. Pilih menu di samping untuk mengelola produk dan pengguna.</p>
      </main>
    </div>
  );
}
