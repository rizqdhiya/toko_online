-- Perintah untuk membuat tabel variasi produk
-- Jalankan perintah ini di database MySQL Anda

CREATE TABLE produk_variasi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produk_id INT NOT NULL,
    warna VARCHAR(50) NOT NULL,
    gambar VARCHAR(255) NOT NULL,
    FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE
);

-- Contoh cara menambahkan data variasi untuk produk dengan ID = 1
-- Ganti nilai sesuai dengan data Anda

-- INSERT INTO produk_variasi (produk_id, warna, gambar) VALUES (1, 'Merah', '/uploads/nama-file-gambar-merah.jpg');
-- INSERT INTO produk_variasi (produk_id, warna, gambar) VALUES (1, 'Biru', '/uploads/nama-file-gambar-biru.jpg');
