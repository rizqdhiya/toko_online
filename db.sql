-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for toko_baju
CREATE DATABASE IF NOT EXISTS `toko_baju` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `toko_baju`;

-- Dumping structure for table toko_baju.admin_users
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table toko_baju.admin_users: ~0 rows (approximately)
INSERT INTO `admin_users` (`id`, `email`, `password`, `created_at`) VALUES
	(1, 'admin@x.com', '123ad123', '2025-04-12 17:26:38');

-- Dumping structure for table toko_baju.cart_items
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `produk` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table toko_baju.cart_items: ~2 rows (approximately)
INSERT INTO `cart_items` (`id`, `user_id`, `product_id`, `quantity`, `created_at`, `updated_at`) VALUES
	(93, 3, 6, 1, '2025-07-18 14:34:04', '2025-07-18 14:34:04'),
	(95, 3, 1, 1, '2025-07-18 14:34:08', '2025-07-18 14:34:08'),
	(96, 3, 3, 1, '2025-07-18 14:34:09', '2025-07-18 14:34:09');

-- Dumping structure for table toko_baju.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('menunggu_pembayaran','menunggu_konfirmasi','diproses','dikirim','diterima','selesai','batal') NOT NULL DEFAULT 'menunggu_pembayaran',
  `bukti_bayar` varchar(255) DEFAULT NULL,
  `no_resi` varchar(100) DEFAULT NULL,
  `alamat` text,
  `kota_id` int DEFAULT NULL,
  `ongkir` int DEFAULT NULL,
  `kota_nama` varchar(100) DEFAULT NULL,
  `provinsi_nama` varchar(100) DEFAULT NULL,
  `alasan_batal` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table toko_baju.orders: ~9 rows (approximately)
INSERT INTO `orders` (`id`, `user_id`, `total`, `created_at`, `status`, `bukti_bayar`, `no_resi`, `alamat`, `kota_id`, `ongkir`, `kota_nama`, `provinsi_nama`, `alasan_batal`) VALUES
	(51, 3, 261624, '2025-07-18 13:33:16', 'diterima', '/uploads/wb4hd9o1dd5rl5q9w2ikqe2os.png', 'weqweq', 'RT06/05, Bebengan, BOJA', 41, 15000, 'Banyumas', 'Jawa Tengah', NULL),
	(52, 3, 2123257525, '2025-07-18 13:36:51', 'batal', '/uploads/yoqy7a8fzgk721pn9r58k94zw.png', NULL, 'RT06/05, Bebengan, BOJA', 348, 11000, 'Pekalongan', 'Jawa Tengah', 'stok_habis'),
	(53, 11, 157000, '2025-07-18 16:44:44', 'diterima', '/uploads/jqb4sg9g2firqjstbah7h7bg9.03.48', '34223r32r32', 'RT06/05, Bebengan, BOJA', 181, 7000, 'Kendal', 'Jawa Tengah', NULL),
	(54, 11, 178312, '2025-07-18 16:45:44', 'batal', '/uploads/m3mhauc1gpam5oju1rw8oxji2.png', NULL, 'RT06/05, Bebengan, BOJA', 105, 55000, 'Cilacap', 'Jawa Tengah', 'stok_habis');

-- Dumping structure for table toko_baju.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `produk_id` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `harga` int NOT NULL,
  `qty` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `produk_id` (`produk_id`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table toko_baju.order_items: ~3 rows (approximately)
INSERT INTO `order_items` (`id`, `order_id`, `produk_id`, `nama`, `harga`, `qty`) VALUES
	(105, 51, 6, 'asdd', 123312, 2),
	(106, 52, 4, 'erfef e e e e ', 2123123213, 1),
	(107, 52, 6, 'asdd', 123312, 1),
	(108, 53, 8, 'Gamis Hijau Keren', 75000, 2),
	(109, 54, 6, 'asdd', 123312, 1);

-- Dumping structure for table toko_baju.order_reviews
CREATE TABLE IF NOT EXISTS `order_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int NOT NULL,
  `ulasan` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `order_reviews_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table toko_baju.order_reviews: ~0 rows (approximately)

-- Dumping structure for table toko_baju.product_reviews
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int NOT NULL,
  `ulasan` text,
  `rating` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `produk` (`id`),
  CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `product_reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table toko_baju.product_reviews: ~1 rows (approximately)
INSERT INTO `product_reviews` (`id`, `product_id`, `user_id`, `order_id`, `ulasan`, `rating`, `created_at`, `updated_at`) VALUES
	(28, 6, 3, 51, 'ewqss', 5, '2025-07-18 20:34:38', NULL),
	(29, 8, 11, 53, 'best', 5, '2025-07-18 23:46:48', NULL);

-- Dumping structure for table toko_baju.produk
CREATE TABLE IF NOT EXISTS `produk` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) DEFAULT NULL,
  `harga` int DEFAULT NULL,
  `gambar` varchar(255) DEFAULT NULL,
  `deskripsi` text,
  `kategori` varchar(100) DEFAULT NULL,
  `stok` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table toko_baju.produk: ~6 rows (approximately)
INSERT INTO `produk` (`id`, `nama`, `harga`, `gambar`, `deskripsi`, `kategori`, `stok`, `created_at`) VALUES
	(1, 'baju kekok', 29191, '/uploads/56f2b0da-48d0-40d3-9c87-114615145867.jpg', 'bagus banget', 'Kekek', 243, '2025-05-19 04:23:05'),
	(3, 'Rizq Dhiya Ulhaq', 213132, '/uploads/88424fb7-2e74-48ee-b22e-2f0cdc070697.jpg', 'wee', 'asd', 1231, '2025-05-20 04:12:15'),
	(4, 'erfef e e e e ', 2123123213, '/uploads/97ebb304-40a9-48ee-90e4-7f3a9bfa118e.jpg', 'asdasdasd', 'qwqwqw ', 110, '2025-05-22 15:15:19'),
	(5, 'wewe', 122121, '/uploads/5ab0b64e-ae94-4d04-9820-1717ced62544.jpg', 'asd as das ads ', 'qeqww', -4, '2025-06-12 03:56:08'),
	(6, 'asdd', 123312, '/uploads/neqloewh97h7h7rt9skoikkvx.52.50', ' qwe qwe qw qw ewq', 'weqqew', 123088, '2025-06-12 04:36:07'),
	(7, 'Baju Gamis Keren w', 75000, '/uploads/i8u47p4a5kxtuetuno833ekb3.jpg', '', NULL, -1, '2025-06-17 15:44:02'),
	(8, 'Gamis Hijau Keren', 75000, '/uploads/q576uf0c7dlzodsr6lym7sjbq.png', 'Ayo mantap ini ', 'gamis', 2, '2025-07-18 14:36:54');

-- Dumping structure for table toko_baju.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `alamat` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `no_hp` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table toko_baju.users: ~5 rows (approximately)
INSERT INTO `users` (`id`, `nama`, `foto`, `email`, `password`, `alamat`, `created_at`, `no_hp`) VALUES
	(3, 'ainkuu ', '/uploads/sgr1l87ve2209buf80y69c8nw.53.51.png', 't@g.c', '$2b$10$vCBQlAloxsEvb1sAz7Ksm.L9R4V6C5rPDPf/aTD1sQH0YQQX7QfMy', 'BOJA NIH BOSS', '2025-04-29 05:57:57', NULL),
	(6, 'Rizq Dhiya aa', NULL, 'rrawr@g.com', '$2b$10$xcUxKSEBHErsyFfgLwLcGe9uK3r9AbVvxJArBo3tunIkGDJ.dlT0m', 'boja ss', '2025-05-19 04:03:19', NULL),
	(7, 'weqqw', NULL, 'cc@f.co', '$2b$10$ug2zg93nlp2Fg2bdbOalbeD6x0ag11dmzY9Q0RFWP3wifdfIXFJeC', 'wiqeieqw', '2025-05-20 04:45:31', NULL),
	(8, 'qwewqe', NULL, 'wqqw@tr.c', '$2b$10$bgCB68/QDHekaGfCUwZ03O/Tf86ra5DiK4b5qKEKy0MesY9A03sTm', '1230123qw\n\n', '2025-05-20 08:04:38', NULL),
	(11, 'RIZQ DHIYA ULHAQ', NULL, '111202113464@mhs.dinus.ac.id', '$2b$10$ypGfpvdJynzV3nDv5aJ/de5FtNsYwn8Bt/2fhHhoqrks5lE6m2Gw6', 'RT06/05, Bebengan, BOJA', '2025-07-18 16:23:45', '081312204790');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
