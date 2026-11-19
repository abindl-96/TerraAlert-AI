-- TerraAlert AI Database Schema
-- Database: terraalertai

-- Create database (run this first)
CREATE DATABASE IF NOT EXISTS terraalertai;
USE terraalertai;

-- 1. User Table
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    location VARCHAR(255),
    district VARCHAR(100),
    pincode VARCHAR(10),
    password VARCHAR(255) NOT NULL,
    usertype VARCHAR(50) DEFAULT 'user',
    isBlocked TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Admin Table
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Guidelines Table
CREATE TABLE IF NOT EXISTS guidlines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Requests Table
CREATE TABLE IF NOT EXISTS requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service INT NOT NULL,
    user_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 6. Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 7. Risk Predictions Table
CREATE TABLE IF NOT EXISTS risk_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    risk_percentage DECIMAL(5, 2) NOT NULL,
    pincode VARCHAR(10),
    district VARCHAR(100),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL,
    INDEX idx_location (latitude, longitude),
    INDEX idx_pincode (pincode),
    INDEX idx_created_at (created_at)
);

-- 8. Government Authorities Table
CREATE TABLE IF NOT EXISTS government_authorities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    district VARCHAR(255),
    state VARCHAR(255),
    pincode VARCHAR(10),
    designation VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_district (district),
    INDEX idx_state (state)
);

-- Insert default admin (password should be hashed in production)
-- Default password: admin123 (change this!)
INSERT INTO admin (email, password, name) 
VALUES ('admin@terraalert.com', 'admin123', 'Admin User')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample categories
INSERT INTO categories (name) VALUES 
('Emergency Response'),
('Landslide Prevention'),
('Safety Guidelines'),
('Weather Monitoring')
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample guidelines for "Before Landslide" (Prevention)
INSERT INTO guidlines (title, description, type) VALUES
('Monitor Weather Conditions', 'Stay informed about weather forecasts, especially during monsoon seasons. Pay attention to heavy rainfall warnings and landslide alerts issued by local authorities. Use weather apps and official government alerts to stay updated.', 'before'),
('Inspect Your Property Regularly', 'Regularly inspect your property for signs of potential landslides such as cracks in walls, tilting trees, bulging ground, or new springs. Check drainage systems and ensure they are clear of debris. Look for changes in water flow patterns.', 'before'),
('Maintain Proper Drainage', 'Ensure proper drainage around your property. Clean gutters, downspouts, and drainage ditches regularly. Divert water away from slopes using proper drainage systems. Avoid blocking natural water channels.', 'before'),
('Avoid Building on Steep Slopes', 'If possible, avoid building on steep slopes or near cliff edges. If you must build on a slope, consult with geotechnical engineers and follow local building codes. Use retaining walls and proper foundation systems.', 'before'),
('Plant Vegetation on Slopes', 'Plant deep-rooted vegetation on slopes to help stabilize the soil. Trees and shrubs with extensive root systems can help prevent soil erosion and landslides. Avoid removing existing vegetation from slopes.', 'before'),
('Prepare an Emergency Kit', 'Prepare an emergency kit with essential supplies including water, non-perishable food, first aid kit, flashlight, batteries, important documents, and emergency contact numbers. Keep the kit in an easily accessible location.', 'before'),
('Create an Evacuation Plan', 'Develop and practice an evacuation plan with your family. Identify safe evacuation routes away from slopes and valleys. Establish a meeting point and ensure all family members know the plan. Keep emergency contact numbers handy.', 'before')
ON DUPLICATE KEY UPDATE title=title;

-- Insert sample guidelines for "During Landslide" (Response)
INSERT INTO guidlines (title, description, type) VALUES
('Evacuate Immediately', 'If you notice signs of an imminent landslide (cracking sounds, rapid water flow, ground movement), evacuate immediately. Do not wait for official warnings. Move to higher ground or a safe location away from the slope.', 'during'),
('Stay Away from Slopes', 'During heavy rainfall or landslide warnings, stay away from steep slopes, cliffs, and areas prone to landslides. Avoid driving through areas with known landslide risks. Do not attempt to cross debris flows.', 'during'),
('Listen for Warning Signs', 'Listen for unusual sounds such as trees cracking, boulders knocking together, or rumbling sounds. These may indicate an approaching landslide. If you hear these sounds, move to safety immediately.', 'during'),
('Avoid Low-Lying Areas', 'During heavy rainfall, avoid low-lying areas, valleys, and areas near streams or rivers. These areas are more susceptible to debris flows and flash floods that often accompany landslides.', 'during'),
('Do Not Return to Evacuated Areas', 'Once you have evacuated, do not return to the area until authorities declare it safe. Landslides can continue for hours or days after the initial event. Wait for official clearance before returning.', 'during'),
('Stay Informed', 'Keep listening to local radio, TV, or official social media channels for updates and instructions from authorities. Follow evacuation orders immediately and do not delay.', 'during')
ON DUPLICATE KEY UPDATE title=title;

-- Insert sample guidelines for "After Landslide" (Recovery)
INSERT INTO guidlines (title, description, type) VALUES
('Wait for Official Clearance', 'Do not return to the affected area until local authorities have declared it safe. Landslides can trigger additional slides, and the area may still be unstable. Wait for professional assessment before returning.', 'after'),
('Check for Injuries', 'After a landslide, check yourself and others for injuries. Provide first aid if needed and seek medical attention for serious injuries. Be aware that medical services may be overwhelmed, so prioritize critical cases.', 'after'),
('Avoid Damaged Buildings', 'Do not enter damaged buildings or structures. They may be unstable and could collapse. Wait for structural engineers to assess the safety of buildings before entering. Report damaged structures to authorities.', 'after'),
('Watch for Additional Slides', 'Be alert for additional landslides. Heavy rainfall can trigger multiple slides. Stay away from slopes and unstable areas. Monitor weather conditions and be prepared to evacuate again if necessary.', 'after'),
('Document Damage', 'Take photographs of damage to your property for insurance purposes. Document all losses and damages. Contact your insurance company as soon as possible to file a claim. Keep all receipts for emergency expenses.', 'after'),
('Check Utilities', 'Check for gas leaks, electrical damage, and water line breaks. If you smell gas or see damaged electrical lines, turn off utilities at the main switch and contact utility companies. Do not use damaged utilities.', 'after'),
('Seek Professional Help', 'Contact professional geotechnical engineers to assess slope stability before rebuilding. Consult with local authorities about rebuilding regulations and safety requirements. Follow recommended safety measures.', 'after'),
('Support Community Recovery', 'Work with your community and local authorities for recovery efforts. Help neighbors who may need assistance. Participate in community cleanup and rebuilding efforts while following safety guidelines.', 'after')
ON DUPLICATE KEY UPDATE title=title;

-- Create indexes for better performance
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_request_status ON requests(status);
CREATE INDEX idx_request_user ON requests(user_id);
CREATE INDEX idx_guidlines_type ON guidlines(type);
CREATE INDEX idx_risk_predictions_date ON risk_predictions(created_at);
CREATE INDEX idx_government_authorities_email ON government_authorities(email);
CREATE INDEX idx_government_authorities_status ON government_authorities(status);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    location_name VARCHAR(255),
    risk_level VARCHAR(50),
    risk_percentage DECIMAL(5, 2),
    pincode VARCHAR(10),
    created_by INT,
    created_by_type VARCHAR(50) DEFAULT 'government',
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES government_authorities(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_priority (priority),
    INDEX idx_pincode (pincode)
);

-- 11. User Notifications Read Status Table
CREATE TABLE IF NOT EXISTS user_notification_read (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_notification (user_id, notification_id),
    INDEX idx_user_id (user_id),
    INDEX idx_notification_id (notification_id)
);

-- 9. Government Alerts Table
CREATE TABLE IF NOT EXISTS government_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    authority_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    risk_prediction_id INT,
    location_name VARCHAR(255),
    risk_percentage DECIMAL(5, 2),
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'unread',
    sent_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (authority_id) REFERENCES government_authorities(id) ON DELETE CASCADE,
    FOREIGN KEY (risk_prediction_id) REFERENCES risk_predictions(id) ON DELETE SET NULL,
    FOREIGN KEY (sent_by) REFERENCES admin(id) ON DELETE SET NULL,
    INDEX idx_authority_id (authority_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_priority (priority)
);