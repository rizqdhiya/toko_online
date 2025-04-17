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
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });
    const data = await res.json();
    setMsg(data.message);
  
    if (res.ok) {
            localStorage.setItem("authNama", data.nama);
            localStorage.setItem("authToken", data.token);
            onClose();
            location.reload();
        }
  };
  
  
  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMsg(data.message);
    if (res.ok) {
      setForm({ nama: "", email: "", password: "", alamat: "" });
      setTab("login"); // Pindah ke tab login setelah register sukses
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md backdrop-brightness-90 transition-all duration-300">
        <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black text-2xl"
        >
          &times;
        </button>

        {/* Tab Login / Register */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setTab("login")}
            className={`${
              tab === "login" ? "font-bold text-blue-600" : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab("register")}
            className={`${
              tab === "register" ? "font-bold text-blue-600" : "text-gray-500"
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Form login */}
        {tab === "login" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        ) : (
          // Form register
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nama"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <textarea
              placeholder="Alamat"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Daftar
            </button>
          </form>
        )}

        {msg && <p className="text-sm text-center text-gray-600">{msg}</p>}
      </div>
    </div>
  );
}
