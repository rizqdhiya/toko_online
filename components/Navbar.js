import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FaSearch, FaUser } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import AuthModal from "./AuthModal";
import { FiShoppingCart } from "react-icons/fi";
import Swal from "sweetalert2"; // install sweetalert2 jika belum: npm install sweetalert2

export default function Navbar() {
  const [showAuth, setShowAuth] = useState(false);
  const [userName, setUserName] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [fotoProfil, setFotoProfil] = useState("");
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const kategoriRef = useRef(null);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("authNama");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authFoto");
    location.reload();
  };

  const handleKategoriClick = async (kategori) => {
    Swal.fire({
      title: 'Memuat produk...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    await router.push(`/produk/${kategori}`);
    Swal.close();
  };

  // Handle click outside untuk dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (kategoriRef.current && !kategoriRef.current.contains(e.target)) {
        setKategoriOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cek user login saat pertama load
  useEffect(() => {
    const nama = localStorage.getItem("authNama");
    const foto = localStorage.getItem("authFoto");
    if (nama) setUserName(nama);
    else setUserName("");
    if (foto) setFotoProfil(foto);
    else setFotoProfil("");
  }, [userName]);

  // Ambil jumlah produk di keranjang saat user login
  useEffect(() => {
    const fetchCartCount = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setCartCount(0);
        return;
      }
      try {
        const res = await fetch("/api/cart", { credentials: "include" });
        const data = await res.json();
        if (Array.isArray(data)) {
          // Jumlah produk unik (bukan qty)
          setCartCount(data.length);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };
    fetchCartCount();
  }, [userName]); // refresh saat user login/logout

  // Fungsi handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      router.push(`/`);
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Bagian Kiri */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Logo Toko"
                  width={120}
                  height={40}
                  priority
                  className="h-10 w-auto object-contain"
                />
              </Link>

              {/* Dropdown Kategori */}
              <div ref={kategoriRef} className="relative">
                <button
                  onClick={() => setKategoriOpen(!kategoriOpen)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Kategori
                </button>

                {kategoriOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => handleKategoriClick("gamis")}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Gamis
                      </button>
                      <button
                        onClick={() => handleKategoriClick("baju-anak")}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Baju Anak
                      </button>
                      <button
                        onClick={() => handleKategoriClick("hem")}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Hem
                      </button>
                      <button
                        onClick={() => handleKategoriClick("daster")}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Daster
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bagian Tengah - Search */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm placeholder-gray-500"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaSearch />
                  </button>
                </div>
              </form>
            </div>

            {/* Bagian Kanan */}
            <div className="flex items-center space-x-4">
              {/* Keranjang */}
              <Link
                href="/keranjang"
                className="p-2 hover:bg-gray-100 rounded-full relative"
              >
                <FiShoppingCart className="text-xl text-gray-600" />
                {/* Badge Jumlah */}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profil Pengguna */}
              {userName ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {fotoProfil ? (
                      <img
                        src={fotoProfil}
                        alt="Profil"
                        className="w-8 h-8 rounded-full object-cover border mr-2"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                        <FaUser className="text-gray-500" />
                      </span>
                    )}
                    <span>{userName.split(" ")[0]}</span>
                    {/* Optional: Tambahkan icon panah bawah */}
                    <svg className="ml-1 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        <Link
                          href="/profil"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profil Saya
                        </Link>
                        <Link
                          href="/wishlist"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Wishlist
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Masuk/Daftar
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}