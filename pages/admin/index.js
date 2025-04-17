import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const res = await fetch('/api/check-auth');
      if (!res.ok) {
        router.push('/login');
        return;
      }

      const userRes = await fetch('/api/users');
      const data = await userRes.json();
      setUsers(data);
      setLoading(false);
    };

    checkAuthAndFetch();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Yakin mau hapus user ini?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    setUsers(users.filter(user => user.id !== id));
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Users</h1>
        <Link href="/admin/users/tambah" className="bg-blue-600 text-white px-4 py-2 rounded">Tambah User</Link>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border">ID</th>
            <th className="p-3 border">Nama</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-3 border">{user.id}</td>
                <td className="p-3 border">{user.name}</td>
                <td className="p-3 border">{user.email}</td>
                <td className="p-3 border space-x-3">
                  <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">Belum ada user.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
