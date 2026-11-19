-- Government Authorities Table
-- This table stores information about government authorities/agencies

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

-- Sample data (optional)
-- Default password for all sample accounts: gov123 (change in production!)
INSERT INTO government_authorities (name, department, email, phone_number, password, address, district, state, pincode, designation, status) VALUES
('Dr. Rajesh Kumar', 'Disaster Management', 'rajesh.kumar@disaster.gov.in', '9876543210', 'gov123', 'Disaster Management Office, Block A', 'Thiruvananthapuram', 'Kerala', '695001', 'Director', 'active'),
('Ms. Priya Sharma', 'Emergency Services', 'priya.sharma@emergency.gov.in', '9876543211', 'gov123', 'Emergency Control Room, Sector 5', 'Kochi', 'Kerala', '682001', 'Deputy Director', 'active'),
('Mr. Suresh Nair', 'Landslide Monitoring', 'suresh.nair@landslide.gov.in', '9876543212', 'gov123', 'Geological Survey Office', 'Idukki', 'Kerala', '685501', 'Senior Geologist', 'active')
ON DUPLICATE KEY UPDATE email=email;
