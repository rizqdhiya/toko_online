import { useState, useEffect, useRef } from "react";

export default function AuthModal({ show, onClose }) {
  const modalRef = useRef(null);
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    alamat: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form dan pesan saat tab berganti
  useEffect(() => {
    setForm({ nama: "", email: "", password: "", alamat: "" });
    setMsg("");
  }, [tab]);

  // Handle klik di luar modal untuk menutup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });
    const data = await res.json();
  
    if (res.ok) {
      localStorage.setItem("authNama", data.nama);
      localStorage.setItem("authToken", data.token);
      onClose();
      location.reload();
    } else {
      setMsg(data.message || "Login gagal.");
    }
    setLoading(false);
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (res.ok) {
      setMsg("Registrasi berhasil! Silakan login.");
      setForm({ nama: "", email: "", password: "", alamat: "" });
      setTab("login"); // Pindah ke tab login setelah register sukses
    } else {
      setMsg(data.message || "Registrasi gagal.");
    }
    setLoading(false);
  };

  const isError = msg && (msg.toLowerCase().includes('gagal') || msg.toLowerCase().includes('salah'));
  const isSuccess = msg && msg.toLowerCase().includes('berhasil');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform transition-all animate-fade-in-down"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tab Login / Register */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setTab("login")}
            className={`w-1/2 py-3 text-center text-sm font-medium transition-all duration-300 ${
              tab === "login" 
              ? "border-b-2 border-blue-600 text-blue-600" 
              : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setTab("register")}
            className={`w-1/2 py-3 text-center text-sm font-medium transition-all duration-300 ${
              tab === "register" 
              ? "border-b-2 border-blue-600 text-blue-600" 
              : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Form login */}
        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="email@contoh.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        ) : (
          // Form register
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="register-nama" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                id="register-nama"
                type="text"
                placeholder="Nama Lengkap Anda"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                required
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="register-email"
                type="email"
                placeholder="email@contoh.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                required
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                required
              />
            </div>
            <div>
              <label htmlFor="register-alamat" className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                id="register-alamat"
                placeholder="Alamat Lengkap"
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                rows={2}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
        )}

        {msg && (
          <p className={`text-sm text-center mt-4 p-2 rounded-md ${
            isError ? 'bg-red-100 text-red-700' : isSuccess ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
