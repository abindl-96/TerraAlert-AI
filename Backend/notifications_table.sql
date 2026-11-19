-- Notifications Table
-- Stores public alerts sent by government authorities to all users

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

-- User Notifications Read Status Table
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
