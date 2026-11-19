-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: tearraalert_ai
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'admin@terraalert.com','admin123','Admin User','2026-01-31 16:47:34','2026-01-31 16:47:34');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Emergency Response','2026-01-31 16:47:34','2026-01-31 16:47:34'),(2,'Landslide Prevention','2026-01-31 16:47:34','2026-01-31 16:47:34'),(3,'Safety Guidelines','2026-01-31 16:47:34','2026-01-31 16:47:34'),(4,'Weather Monitoring','2026-01-31 16:47:34','2026-01-31 16:47:34');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedbacks`
--

DROP TABLE IF EXISTS `feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedbacks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `service_id` int DEFAULT NULL,
  `feedback` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `feedbacks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedbacks_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedbacks`
--

LOCK TABLES `feedbacks` WRITE;
/*!40000 ALTER TABLE `feedbacks` DISABLE KEYS */;
/*!40000 ALTER TABLE `feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `government_alerts`
--

DROP TABLE IF EXISTS `government_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `government_alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `authority_id` int NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `risk_prediction_id` int DEFAULT NULL,
  `location_name` varchar(255) DEFAULT NULL,
  `risk_percentage` decimal(5,2) DEFAULT NULL,
  `priority` varchar(50) DEFAULT 'medium',
  `status` varchar(50) DEFAULT 'unread',
  `sent_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `risk_prediction_id` (`risk_prediction_id`),
  KEY `sent_by` (`sent_by`),
  KEY `idx_authority_id` (`authority_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_priority` (`priority`),
  CONSTRAINT `government_alerts_ibfk_1` FOREIGN KEY (`authority_id`) REFERENCES `government_authorities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `government_alerts_ibfk_2` FOREIGN KEY (`risk_prediction_id`) REFERENCES `risk_predictions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `government_alerts_ibfk_3` FOREIGN KEY (`sent_by`) REFERENCES `admin` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `government_alerts`
--

LOCK TABLES `government_alerts` WRITE;
/*!40000 ALTER TABLE `government_alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `government_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `government_authorities`
--

DROP TABLE IF EXISTS `government_authorities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `government_authorities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` text,
  `district` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_district` (`district`),
  KEY `idx_state` (`state`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `government_authorities`
--

LOCK TABLES `government_authorities` WRITE;
/*!40000 ALTER TABLE `government_authorities` DISABLE KEYS */;
INSERT INTO `government_authorities` VALUES (1,'Dr. Rajesh Kumar','Disaster Management','rajesh.kumar@disaster.gov.in','9876543210','gov123','Disaster Management Office, Block A','Thiruvananthapuram','Kerala','695001','Director','active','2026-01-31 18:57:42','2026-01-31 18:57:42'),(2,'Ms. Priya Sharma','Emergency Services','priya.sharma@emergency.gov.in','9876543211','gov123','Emergency Control Room, Sector 5','Kochi','Kerala','682001','Deputy Director','active','2026-01-31 18:57:42','2026-01-31 18:57:42'),(3,'Mr. Suresh Nair','Landslide Monitoring','suresh.nair@landslide.gov.in','9876543212','gov123','Geological Survey Office','Idukki','Kerala','685501','Senior Geologist','active','2026-01-31 18:57:42','2026-01-31 18:57:42');
/*!40000 ALTER TABLE `government_authorities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guidlines`
--

DROP TABLE IF EXISTS `guidlines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guidlines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `type` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guidlines`
--

LOCK TABLES `guidlines` WRITE;
/*!40000 ALTER TABLE `guidlines` DISABLE KEYS */;
INSERT INTO `guidlines` VALUES (2,'Monitor Weather Conditions','Stay informed about weather forecasts, especially during monsoon seasons. Pay attention to heavy rainfall warnings and landslide alerts issued by local authorities. Use weather apps and official government alerts to stay updated.','before','2026-01-31 17:13:13','2026-01-31 17:13:13'),(3,'Inspect Your Property Regularly','Regularly inspect your property for signs of potential landslides such as cracks in walls, tilting trees, bulging ground, or new springs. Check drainage systems and ensure they are clear of debris. Look for changes in water flow patterns.','before','2026-01-31 17:13:13','2026-01-31 17:13:13'),(4,'Maintain Proper Drainage','Ensure proper drainage around your property. Clean gutters, downspouts, and drainage ditches regularly. Divert water away from slopes using proper drainage systems. Avoid blocking natural water channels.','before','2026-01-31 17:13:13','2026-01-31 17:13:13'),(5,'Avoid Building on Steep Slopes','If possible, avoid building on steep slopes or near cliff edges. If you must build on a slope, consult with geotechnical engineers and follow local building codes. Use retaining walls and proper foundation systems.','before','2026-01-31 17:13:13','2026-01-31 17:13:13'),(6,'Plant Vegetation on Slopes','Plant deep-rooted vegetation on slopes to help stabilize the soil. Trees and shrubs with extensive root systems can help prevent soil erosion and landslides. Avoid removing existing vegetation from slopes.','before','2026-01-31 17:13:13','2026-01-31 17:13:13'),(7,'Prepare an Emergency Kit','Prepare an emergency kit with essential supplies including water, non-perishable food, first aid kit, flashlight, batteries, important documents, and emergency contact numbers. Keep the kit in an easily accessible location.','before','2026-01-31 17:13:13','2026-01-31 17:13:13'),(8,'Create an Evacuation Plan','Develop and practice an evacuation plan with your family. Identify safe evacuation routes away from slopes and valleys. Establish a meeting point and ensure all family members know the plan. Keep emergency contact numbers handy.','before','2026-01-31 17:13:13','2026-01-31 17:13:13'),(9,'Evacuate Immediately','If you notice signs of an imminent landslide (cracking sounds, rapid water flow, ground movement), evacuate immediately. Do not wait for official warnings. Move to higher ground or a safe location away from the slope.','during','2026-01-31 17:13:13','2026-01-31 17:13:13'),(10,'Stay Away from Slopes','During heavy rainfall or landslide warnings, stay away from steep slopes, cliffs, and areas prone to landslides. Avoid driving through areas with known landslide risks. Do not attempt to cross debris flows.','during','2026-01-31 17:13:13','2026-01-31 17:13:13'),(11,'Listen for Warning Signs','Listen for unusual sounds such as trees cracking, boulders knocking together, or rumbling sounds. These may indicate an approaching landslide. If you hear these sounds, move to safety immediately.','during','2026-01-31 17:13:13','2026-01-31 17:13:13'),(12,'Avoid Low-Lying Areas','During heavy rainfall, avoid low-lying areas, valleys, and areas near streams or rivers. These areas are more susceptible to debris flows and flash floods that often accompany landslides.','during','2026-01-31 17:13:13','2026-01-31 17:13:13'),(13,'Do Not Return to Evacuated Areas','Once you have evacuated, do not return to the area until authorities declare it safe. Landslides can continue for hours or days after the initial event. Wait for official clearance before returning.','during','2026-01-31 17:13:13','2026-01-31 17:13:13'),(14,'Stay Informed','Keep listening to local radio, TV, or official social media channels for updates and instructions from authorities. Follow evacuation orders immediately and do not delay.','during','2026-01-31 17:13:13','2026-01-31 17:13:13'),(15,'Wait for Official Clearance','Do not return to the affected area until local authorities have declared it safe. Landslides can trigger additional slides, and the area may still be unstable. Wait for professional assessment before returning.','after','2026-01-31 17:13:13','2026-01-31 17:13:13'),(16,'Check for Injuries','After a landslide, check yourself and others for injuries. Provide first aid if needed and seek medical attention for serious injuries. Be aware that medical services may be overwhelmed, so prioritize critical cases.','after','2026-01-31 17:13:13','2026-01-31 17:13:13'),(17,'Avoid Damaged Buildings','Do not enter damaged buildings or structures. They may be unstable and could collapse. Wait for structural engineers to assess the safety of buildings before entering. Report damaged structures to authorities.','after','2026-01-31 17:13:13','2026-01-31 17:13:13'),(18,'Watch for Additional Slides','Be alert for additional landslides. Heavy rainfall can trigger multiple slides. Stay away from slopes and unstable areas. Monitor weather conditions and be prepared to evacuate again if necessary.','after','2026-01-31 17:13:13','2026-01-31 17:13:13'),(19,'Document Damage','Take photographs of damage to your property for insurance purposes. Document all losses and damages. Contact your insurance company as soon as possible to file a claim. Keep all receipts for emergency expenses.','after','2026-01-31 17:13:13','2026-01-31 17:13:13'),(20,'Check Utilities','Check for gas leaks, electrical damage, and water line breaks. If you smell gas or see damaged electrical lines, turn off utilities at the main switch and contact utility companies. Do not use damaged utilities.','after','2026-01-31 17:13:13','2026-01-31 17:13:13'),(21,'Seek Professional Help','Contact professional geotechnical engineers to assess slope stability before rebuilding. Consult with local authorities about rebuilding regulations and safety requirements. Follow recommended safety measures.','after','2026-01-31 17:13:13','2026-01-31 17:13:13'),(22,'Support Community Recovery','Work with your community and local authorities for recovery efforts. Help neighbors who may need assistance. Participate in community cleanup and rebuilding efforts while following safety guidelines.','after','2026-01-31 17:13:13','2026-01-31 17:13:13');
/*!40000 ALTER TABLE `guidlines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'info',
  `location_name` varchar(255) DEFAULT NULL,
  `risk_level` varchar(50) DEFAULT NULL,
  `risk_percentage` decimal(5,2) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_by_type` varchar(50) DEFAULT 'government',
  `status` varchar(50) DEFAULT 'active',
  `priority` varchar(50) DEFAULT 'medium',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_priority` (`priority`),
  KEY `idx_pincode` (`pincode`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `government_authorities` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'Public Landslide Alert','Please stay alert and follow safety guidelines. Monitor weather conditions and avoid high-risk areas.','warning',NULL,NULL,NULL,NULL,NULL,2,'government','active','high','2026-01-31 19:57:53','2026-01-31 19:57:53');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requests`
--

DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service` int NOT NULL,
  `user_id` int NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `service` (`service`),
  KEY `idx_request_status` (`status`),
  KEY `idx_request_user` (`user_id`),
  CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`service`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `risk_predictions`
--

DROP TABLE IF EXISTS `risk_predictions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `risk_predictions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `location_name` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `risk_percentage` decimal(5,2) NOT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_location` (`latitude`,`longitude`),
  KEY `idx_pincode` (`pincode`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `risk_predictions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `risk_predictions`
--

LOCK TABLES `risk_predictions` WRITE;
/*!40000 ALTER TABLE `risk_predictions` DISABLE KEYS */;
INSERT INTO `risk_predictions` VALUES (1,'Aluva - 683101, Kerala, India',10.10776820,76.35685320,26.00,'683101','Ernakulam',1,'2026-01-31 18:38:16','2026-03-04 19:38:52'),(2,'Munnar, Kerala',10.08890000,77.05950000,24.00,'685612','Idukki',3,'2026-02-01 07:11:56','2026-03-04 19:38:52'),(3,'Wayanad, Vythiri - 670721, Kerala, India',11.73996970,76.09624950,35.00,'670721','Wayanad',4,'2026-03-04 19:34:47','2026-03-04 19:34:47'),(4,'Alappuzha, - 688001, Kerala, India',9.49577080,76.33088720,13.00,'688001','Alappuzha',5,'2026-03-04 19:47:31','2026-03-04 19:47:31');
/*!40000 ALTER TABLE `risk_predictions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `usertype` varchar(50) DEFAULT 'user',
  `isBlocked` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'yaser','yaser@gmail.com','9856852145','Ernakula','Ernakulam','680666','Asdasd','user',0,'2026-01-31 16:50:58','2026-03-04 19:39:30'),(2,'Naazim','mohdnaazim252@gmail.com','8528528520','Paravur','Ernakulam','683101','Asdasd','user',0,'2026-01-31 19:39:06','2026-03-04 19:41:53'),(3,'Abin','abinjithu96@gmail.com','8569856923','ALUVA','idukki','685612','Asdasd','user',0,'2026-02-01 07:11:24','2026-03-04 19:43:14'),(4,'tester','yasermohammed687@gmail.com','3216547891','Wayanad','Wayanad','670721','rohit@222','user',0,'2026-03-04 19:30:20','2026-03-04 19:36:20'),(5,'Test2','test2@gmail.com','7894565415','Alappuzha','Alappuzha','688001','rohit@222','user',0,'2026-03-04 19:46:59','2026-03-04 19:46:59');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notification_read`
--

DROP TABLE IF EXISTS `user_notification_read`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notification_read` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `notification_id` int NOT NULL,
  `read_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_notification` (`user_id`,`notification_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_notification_id` (`notification_id`),
  CONSTRAINT `user_notification_read_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_notification_read_ibfk_2` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notification_read`
--

LOCK TABLES `user_notification_read` WRITE;
/*!40000 ALTER TABLE `user_notification_read` DISABLE KEYS */;
INSERT INTO `user_notification_read` VALUES (1,1,1,'2026-01-31 19:58:44');
/*!40000 ALTER TABLE `user_notification_read` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-05  1:20:20
