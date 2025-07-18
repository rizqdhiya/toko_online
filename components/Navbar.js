import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FaSearch, FaUser } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import AuthModal from "./AuthModal";
import { FiShoppingCart, FiChevronDown } from "react-icons/fi";
import Swal from "sweetalert2";

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

  const handleKategoriClick = (kategori) => {
    setKategoriOpen(false); // Tutup dropdown setelah diklik
    Swal.fire({
      title: 'Memuat produk...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    // Navigasi ke halaman utama dengan query kategori
    router.push(`/?kategori=${kategori}`);
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
  }, []);

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
          setCartCount(data.length);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };
    
    // Panggil saat komponen dimuat dan setiap kali ada perubahan pada cart
    fetchCartCount();
    
    const handleStorageChange = () => {
        const nama = localStorage.getItem("authNama");
        const foto = localStorage.getItem("authFoto");
        setUserName(nama || "");
        setFotoProfil(foto || "");
        fetchCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdate', fetchCartCount); // Custom event

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('cartUpdate', fetchCartCount);
    };
  }, []);

  // *** Efek untuk live search dengan debouncing ***
  useEffect(() => {
    // Set timer untuk melakukan search setelah 500ms pengguna berhenti mengetik
    const timer = setTimeout(() => {
      if (searchInput) {
        router.push(`/?search=${encodeURIComponent(searchInput)}`);
      } else if (router.query.search) {
        // Jika input kosong tapi sebelumnya ada query search, kembali ke halaman utama
        router.push(`/`);
      }
    }, 500); // 500ms debounce time

    // Bersihkan timer jika user kembali mengetik sebelum 500ms
    return () => {
      clearTimeout(timer);
    };
  }, [searchInput, router]); // Efek ini akan berjalan setiap kali searchInput berubah

  // Set initial search input value from URL query
  useEffect(() => {
    if (router.query.search) {
        setSearchInput(router.query.search);
    }
  }, [router.query.search]);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
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
              <div ref={kategoriRef} className="relative hidden md:block">
                <button
                  onClick={() => setKategoriOpen(!kategoriOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Kategori
                  <FiChevronDown className={`transition-transform duration-200 ${kategoriOpen ? 'rotate-180' : ''}`} />
                </button>

                {kategoriOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 animate-fade-in-down">
                    <div className="py-1">
                      <button
                        onClick={() => handleKategoriClick("Gamis")}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Gamis
                      </button>
                      <button
                        onClick={() => handleKategoriClick("Baju Anak")}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Baju Anak
                      </button>
                      <button
                        onClick={() => handleKategoriClick("Hem")}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Hem
                      </button>
                      <button
                        onClick={() => handleKategoriClick("Daster")}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari produk favoritmu..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white text-sm placeholder-gray-500 transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaSearch />
                </span>
              </div>
            </div>

            {/* Bagian Kanan */}
            <div className="flex items-center space-x-4">
              {/* Keranjang */}
              <Link
                href="/keranjang"
                className="p-2 hover:bg-gray-100 rounded-full relative transition-colors"
              >
                <FiShoppingCart className="text-2xl text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profil Pengguna */}
              {userName ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {fotoProfil ? (
                      <img
                        src={fotoProfil}
                        alt="Profil"
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <FaUser className="text-gray-500" />
                      </span>
                    )}
                    <span className="hidden md:inline">{userName.split(" ")[0]}</span>
                    <FiChevronDown className={`transition-transform duration-200 text-gray-400 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 animate-fade-in-down">
                      <div className="py-1">
                        <Link
                          href="/profil"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          Profil Saya
                        </Link>
                        <div className="border-t my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                  className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors"
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