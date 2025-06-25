// pages/admin/users/index.js
import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Yakin mau hapus user ini?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    setUsers(users.filter((users) => users.id !== id));
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Daftar Users</h1>
        <Link href="/admin/users/tambah" className="bg-blue-600 text-white px-4 py-2 rounded">Tambah User</Link>
      </div>
      <table className="w-full border text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">ID</th>
            <th className="p-2">Nama</th>
            <th className="p-2">Email</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map(users => (
            <tr key={users.id} className="border-t">
              <td className="p-2">{users.id}</td>
              <td className="p-2">{users.nama}</td>
              <td className="p-2">{users.email}</td>
              <td className="p-2 space-x-2">
                <Link href={`/admin/users/${users.id}`} className="text-blue-600">Edit</Link>
                <button onClick={() => handleDelete(users.id)} className="text-red-600">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
