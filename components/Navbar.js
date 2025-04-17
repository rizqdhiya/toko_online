import { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa"; // Import ikon kaca pembesar dari react-icons
import Link from "next/link";
import Image from "next/image";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [showAuth, setShowAuth] = useState(false);
  const [userName, setUserName] = useState("");
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const kategoriRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("authNama");
    localStorage.removeItem("authToken");
    setUserName("");
    setShowDropdown(false);
    location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (kategoriRef.current && !kategoriRef.current.contains(e.target)) {
        setKategoriOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const nama = localStorage.getItem("authNama");
    if (nama) {
      setUserName(nama);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between shadow-md max-w-7xl mx-auto">
        {/* Kiri */}
        <div className="flex items-center space-x-4">
          <Link href="/">
            <div className="cursor-pointer flex items-center">
              <Image
                src="/logo.jpg"
                alt="Logo Toko Baju"
                width={120}
                height={40}
                priority
              />
            </div>
          </Link>

          {/* Dropdown Kategori */}
          <div ref={kategoriRef} className="relative">
            <span
              onClick={() => setKategoriOpen(!kategoriOpen)}
              className="text-sm text-gray-700 px-5 py-2 hover:bg-yellow-200 rounded-full transition cursor-pointer"
            >
              Kategori
            </span>

            {kategoriOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-md z-50">
                <ul className="py-2 text-sm text-gray-700">
                  <li>
                    <Link href="/produk/pria" className="block px-4 py-2 hover:bg-gray-100">
                      Pakaian Pria
                    </Link>
                  </li>
                  <li>
                    <Link href="/produk/wanita" className="block px-4 py-2 hover:bg-gray-100">
                      Pakaian Wanita
                    </Link>
                  </li>
                  <li>
                    <Link href="/produk/anak" className="block px-4 py-2 hover:bg-gray-100">
                      Anak-anak
                    </Link>
                  </li>
                  <li>
                    <Link href="/produk/aksesoris" className="block px-4 py-2 hover:bg-gray-100">
                      Aksesoris
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Tengah: Search */}
        <div className="flex-1 mx-4 hidden md:flex justify-center">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Cari baju favoritmu..."
              className="w-full px-5 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
          </div>
        </div>

        {/* Kanan */}
        <div className="flex items-center space-x-4">
          <Link href="/keranjang">
            <span className="text-2xl px-4 py-2 hover:bg-sky-200 rounded-full cursor-pointer">
              🛒
            </span>
          </Link>

          {/* Dropdown User */}
          {userName ? (
            <div className="relative" ref={dropdownRef}>
              <span
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-sm text-gray-700 px-5 py-2 hover:bg-red-200 rounded-full bg-gray-100 cursor-pointer"
              >
                Halo, {userName.split(" ")[0]}
              </span>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50 border">
                  <ul className="flex flex-col text-sm text-gray-700">
                    <li className="hover:bg-gray-100 px-4 py-2 cursor-pointer">Profil</li>
                    <li className="hover:bg-gray-100 px-4 py-2 cursor-pointer">Favorit</li>
                    <li
                      onClick={handleLogout}
                      className="hover:bg-red-100 text-red-600 px-4 py-2 cursor-pointer"
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <span
              onClick={() => setShowAuth(true)}
              className="text-sm text-gray-700 px-5 py-2 hover:bg-red-200 rounded-full transition cursor-pointer"
            >
              Masuk
            </span>
          )}
        </div>
      </nav>

      <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
