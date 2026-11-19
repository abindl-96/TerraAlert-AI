-- Government Alerts Table
-- Stores email alerts sent by admin to government authorities

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
