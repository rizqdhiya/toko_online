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
        <Link href="/admin/users/tambah" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Tambah User
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md m-5">
        <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium text-gray-700">ID</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-700">Nama</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-700">Email</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-700">No. HP</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4">{user.id}</td>
                <td className="p-4 font-medium text-gray-700">{user.nama}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.no_hp || '-'}</td>
                <td className="p-4 flex space-x-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-100 rounded-md"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 bg-red-100 rounded-md"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
