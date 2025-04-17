// pages/admin/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => {
        if (!data.loggedIn) {
          // Jika belum login, arahkan ke halaman login
          router.push('/admin/login');
        } else {
          // Jika sudah login, arahkan ke dashboard
          router.push('/admin/dashboard');
        }
      });
  }, [router]);

  return <div>Loading...</div>;
}
