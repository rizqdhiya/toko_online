-- --------------------------------------------------------
-- Host:                         yamabiko.proxy.rlwy.net
-- Server version:               9.4.0 - MySQL Community Server - GPL
-- Server OS:                    Linux
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


-- Dumping database structure for railway
CREATE DATABASE IF NOT EXISTS `railway` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `railway`;

-- Dumping structure for table railway.admin_users
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table railway.admin_users: ~1 rows (approximately)
INSERT INTO `admin_users` (`id`, `email`, `password`, `created_at`) VALUES
	(1, 'admin@x.com', '123ad123', '2025-04-12 17:26:38');

-- Dumping structure for table railway.cart_items
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
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table railway.cart_items: ~0 rows (approximately)

-- Dumping structure for table railway.orders
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
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table railway.orders: ~2 rows (approximately)
INSERT INTO `orders` (`id`, `user_id`, `total`, `created_at`, `status`, `bukti_bayar`, `no_resi`, `alamat`, `kota_id`, `ongkir`, `kota_nama`, `provinsi_nama`, `alasan_batal`) VALUES
	(61, 14, 87000, '2025-07-30 03:54:38', 'menunggu_pembayaran', NULL, NULL, 'Semarang Tembalang, Semarang Timur, Semarang, Jawa Tengah', NULL, 7000, 'Semarang', 'Jawa Tengah', NULL),
	(62, 14, 1214000, '2025-07-30 03:58:10', 'menunggu_pembayaran', NULL, NULL, 'semarang, Semarang Timur, Semarang, Jawa Tengah', NULL, 14000, 'Semarang', 'Jawa Tengah', NULL);

-- Dumping structure for table railway.order_items
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
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table railway.order_items: ~2 rows (approximately)
INSERT INTO `order_items` (`id`, `order_id`, `produk_id`, `nama`, `harga`, `qty`) VALUES
	(121, 61, 14, 'Baju Daster Hitam', 80000, 1),
	(122, 62, 19, 'Hem Coklat Krem', 80000, 15);

-- Dumping structure for table railway.order_reviews
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

-- Dumping data for table railway.order_reviews: ~0 rows (approximately)

-- Dumping structure for table railway.product_images
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `produk` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_images_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table railway.product_images: ~2 rows (approximately)
INSERT INTO `product_images` (`id`, `product_id`, `variant_id`, `url`) VALUES
	(22, 18, 14, 'https://ohsvhwdlfgncojklgslh.supabase.co/storage/v1/object/public/upload/1754244747931_WhatsApp%20Image%202025-04-12%20at%2013.23.37_55464444.jpg'),
	(23, 18, NULL, 'https://ohsvhwdlfgncojklgslh.supabase.co/storage/v1/object/public/upload/1753838837484_WhatsApp%20Image%202025-04-12%20at%2013.23.37_991de612.jpg');

-- Dumping structure for table railway.product_reviews
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table railway.product_reviews: ~0 rows (approximately)

-- Dumping structure for table railway.product_variants
CREATE TABLE IF NOT EXISTS `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `warna` varchar(50) NOT NULL,
  `stok` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `produk` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table railway.product_variants: ~1 rows (approximately)
INSERT INTO `product_variants` (`id`, `product_id`, `warna`, `stok`) VALUES
	(14, 18, 'Coklat - L', 10);

-- Dumping structure for table railway.produk
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table railway.produk: ~7 rows (approximately)
INSERT INTO `produk` (`id`, `nama`, `harga`, `gambar`, `deskripsi`, `kategori`, `stok`, `created_at`) VALUES
	(12, 'Baju Daster Biru', 76000, 'https://ohsvhwdlfgncojklgslh.supabase.co/storage/v1/object/public/upload/1753832091252_IMG-20250617-WA0006-Photoroom.png', 'Daster Biru Corak Bunga pastinya keren \nUkuran : - ', 'Daster', 100, '2025-07-29 23:36:06'),
	(13, 'Baju Daster Batik', 80000, 'https://ohsvhwdlfgncojklgslh.supabase.co/storage/v1/object/public/upload/1753832193815_IMG-20250617-WA0013-Photoroom.png', 'Daster Motif batik 2 sisi Corak Bunga pastinya mantap\nUkuran : - ', 'Daster', 20, '2025-07-29 23:37:22'),
	(14, 'Baju Daster Hitam', 80000, 'https://ohsvhwdlfgncojklgslh.supabase.co/storage/v1/object/public/upload/1753832271265_IMG-20250617-WA0003-Photoroom.png', 'Daster Hitam Corak Bunga pastinya mantap  \nUkuran : - ', 'Daster', 99, '2025-07-29 23:38:32'),
	(15, 'Stelan anak ', 50000, 'https://ohsvhwdlfgncojklgslh.supabase.co/storage/v1/object/public/upload/1753832430178_IMG-20250617-WA0022.jpg', 'Stelan baju anak warna silver Corak Bunga pastinya keren \nUkuran : - ', 'Baju Anak', 50, '2025-07-29 23:41:26'),
	(16, 'Baju anak lucu', 95000, 'https://ohsvhwdlfgncojklgslh.supabase.co/storage/v1/object/public/upload/1753837994780_IMG-20250617-WA0018.jpg', 'Baju anak Lucuu Kartun pastinya mantap\nUkuran : -', 'Baju Anak', 100, '2025-07-30 01:14:24'),
	(17, 'Hem Hitam bercorak', 90000, 'https://ohsvhwdlfgncojklgslh.supabase.co/storage/v1/object/public/upload/1753838781448_WhatsApp%20Image%202025-04-12%20at%2013.23.37_6fa37479.jpg', 'Pastinya keren kalau dipakai\nUkuran : XL', 'Hem', 20, '2025-07-30 01:27:03'),
	(18, 'Hem Polos', 80000, 'https://ohsvhwdlfgncojklgslh.supabase.co/storage/v1/object/public/upload/1753838837484_WhatsApp%20Image%202025-04-12%20at%2013.23.37_991de612.jpg', 'Pastinya kalau yg polos ga kalah menarik, ayo buruan beli \nUK - L', 'Hem', 10, '2025-07-30 01:27:51');

-- Dumping structure for table railway.users
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table railway.users: ~2 rows (approximately)
INSERT INTO `users` (`id`, `nama`, `foto`, `email`, `password`, `alamat`, `created_at`, `no_hp`) VALUES
	(13, 'RIZQ DHIYA ULHAQ', NULL, '111202113464@mhs.dinus.ac.id', '$2b$10$/SqGKvlVngFTEJpFW4mn4ehZheG1S1uH1HktVGeX14HYjeFD99SpS', 'RT06/05, Bebengan, BOJA', '2025-07-30 01:34:18', '081312204790'),
	(14, 'RIZQ DHIYA ULHAQ', NULL, 'kikokkikik@mhs.dinus.ac.id', '$2b$10$qvsbmZ5.bxi8X4PwcE.Y7uJYIrkL/f9I0L107Jm3eGD43P1uRHIh2', 'RT06/05, Bebengan, BOJA', '2025-07-30 03:53:37', '081312204790');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
