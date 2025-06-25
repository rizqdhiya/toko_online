// components/AdminLayout.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/check')
      .then((res) => res.json())
      .then((data) => {
        if (!data.loggedIn) {
          router.push('/admin/login');
        } else {
          setIsLoggedIn(true);
        }
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (!isLoggedIn) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-white p-5 shadow-lg">
        <h3 className="text-lg font-semibold">Admin Menu</h3>
        <ul className="mt-4">
          <li><a href="/admin/dashboard" className="block py-2 text-blue-600">Dashboard</a></li>
          <li><a href="/admin/produk" className="block py-2 text-blue-600">Kelola Produk</a></li>
          <li><a href="/admin/users" className="block py-2 text-blue-600">Kelola Users</a></li>
          <li><a href="/admin/orders" className="block py-2 text-blue-600">Konfirmasi Pesanan</a></li>
          <li><button onClick={handleLogout} className="block py-2 text-red-600">Logout</button></li>
        </ul>
      </div>
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}
