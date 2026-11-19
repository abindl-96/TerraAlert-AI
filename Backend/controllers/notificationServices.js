import db from "../config/db.js";

// Create public notification
export const createNotification = (req, res) => {
  const {
    title,
    message,
    type,
    location_name,
    risk_level,
    risk_percentage,
    pincode,
    created_by,
    created_by_type,
    priority,
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  const sql = `INSERT INTO notifications 
    (title, message, type, location_name, risk_level, risk_percentage, pincode, created_by, created_by_type, priority) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    title,
    message,
    type || "info",
    location_name || null,
    risk_level || null,
    risk_percentage || null,
    pincode || null,
    created_by || null,
    created_by_type || "government",
    priority || "medium",
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error creating notification:", err);
      res.status(500).json({ error: "Error creating notification" });
      return;
    }
    console.log("Notification created successfully");
    res.status(200).json({
      message: "Notification created successfully",
      id: result.insertId,
    });
  });
};

// Get all notifications for a user
export const getUserNotifications = (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const sql = `
    SELECT n.*, 
           CASE WHEN unr.id IS NOT NULL THEN 1 ELSE 0 END as is_read,
           unr.read_at
    FROM notifications n
    LEFT JOIN user_notification_read unr ON n.id = unr.notification_id AND unr.user_id = ?
    WHERE n.status = 'active'
    ORDER BY n.created_at DESC
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("Error getting user notifications:", err);
      res.status(500).json({ error: "Error getting notifications" });
      return;
    }
    console.log("User notifications retrieved");
    res.status(200).json({ data: result });
  });
};

// Mark notification as read
export const markNotificationAsRead = (req, res) => {
  const { user_id, notification_id } = req.body;

  if (!user_id || !notification_id) {
    return res.status(400).json({ error: "User ID and notification ID are required" });
  }

  const sql = `INSERT INTO user_notification_read (user_id, notification_id) 
               VALUES (?, ?) 
               ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`;

  db.query(sql, [user_id, notification_id], (err, result) => {
    if (err) {
      console.error("Error marking notification as read:", err);
      res.status(500).json({ error: "Error marking notification as read" });
      return;
    }
    console.log("Notification marked as read");
    res.status(200).json({ message: "Notification marked as read" });
  });
};

// Get all notifications (for admin)
export const getAllNotifications = (req, res) => {
  const sql = `
    SELECT n.*, 
           ga.name as created_by_name,
           COUNT(DISTINCT unr.user_id) as read_count,
           (SELECT COUNT(*) FROM user WHERE isBlocked = 0) as total_users
    FROM notifications n
    LEFT JOIN government_authorities ga ON n.created_by = ga.id AND n.created_by_type = 'government'
    LEFT JOIN user_notification_read unr ON n.id = unr.notification_id
    GROUP BY n.id
    ORDER BY n.created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error getting all notifications:", err);
      res.status(500).json({ error: "Error getting notifications" });
      return;
    }
    console.log("All notifications retrieved");
    res.status(200).json({ data: result });
  });
};

// Update notification
export const updateNotification = (req, res) => {
  const { id } = req.params;
  const { title, message, type, status, priority } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Notification ID is required" });
  }

  const sql = `UPDATE notifications 
               SET title = ?, message = ?, type = ?, status = ?, priority = ?
               WHERE id = ?`;

  const values = [
    title,
    message,
    type,
    status,
    priority,
    id,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating notification:", err);
      res.status(500).json({ error: "Error updating notification" });
      return;
    }
    console.log("Notification updated successfully");
    res.status(200).json({ message: "Notification updated successfully" });
  });
};

// Delete notification
export const deleteNotification = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Notification ID is required" });
  }

  const sql = "DELETE FROM notifications WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting notification:", err);
      res.status(500).json({ error: "Error deleting notification" });
      return;
    }
    console.log("Notification deleted successfully");
    res.status(200).json({ message: "Notification deleted successfully" });
  });
};
