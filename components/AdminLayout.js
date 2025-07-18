// components/AdminLayout.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const menuItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Kelola Produk", href: "/admin/produk" },
    { label: "Kelola Users", href: "/admin/users" },
    { label: "Konfirmasi Pesanan", href: "/admin/orders" },
  ];

  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data) => {
        if (!data.loggedIn) {
          router.push("/admin/login");
        } else {
          setIsLoggedIn(true);
        }
      });
  }, [router]);

  if (!isLoggedIn) return null;

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
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
