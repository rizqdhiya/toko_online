import { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    alamat: '',
    no_hp: '',
  });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setMsg(data.message);

    if (res.ok) {
      setForm({ nama: '', email: '', password: '', alamat: '', no_hp: '' });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Daftar Akun</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nama"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder="Alamat"
          value={form.alamat}
          onChange={(e) => setForm({ ...form, alamat: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        ></textarea>
        <input
          type="text"
          placeholder="Nomor HP"
          value={form.no_hp}
          onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
          Daftar
        </button>
        {msg && <p className="text-sm text-center text-gray-700 mt-2">{msg}</p>}
      </form>
    </div>
  );
}
