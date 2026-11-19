import db from "../config/db.js";

// Generate comprehensive report
export const generateReport = (req, res) => {
  const { start_date, end_date, report_type } = req.query;

  let dateFilter = "";
  const values = [];

  if (start_date && end_date) {
    dateFilter = "WHERE DATE(created_at) BETWEEN ? AND ?";
    values.push(start_date, end_date);
  }

  const reports = {};

  // Risk Predictions Report
  const riskPredictionsSql = `
    SELECT 
      COUNT(*) as total_predictions,
      COUNT(CASE WHEN risk_percentage >= 86 THEN 1 END) as critical_count,
      COUNT(CASE WHEN risk_percentage >= 61 AND risk_percentage < 86 THEN 1 END) as high_count,
      COUNT(CASE WHEN risk_percentage >= 31 AND risk_percentage < 61 THEN 1 END) as moderate_count,
      COUNT(CASE WHEN risk_percentage < 31 THEN 1 END) as low_count,
      AVG(risk_percentage) as avg_risk,
      MAX(risk_percentage) as max_risk,
      MIN(risk_percentage) as min_risk
    FROM risk_predictions
    ${dateFilter}
  `;

  db.query(riskPredictionsSql, values, (err, riskData) => {
    if (err) {
      console.error("Error getting risk predictions report:", err);
      return res.status(500).json({ error: "Error generating report" });
    }

    reports.risk_predictions = riskData[0];

    // Notifications Report
    const notificationsSql = `
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning_count,
        COUNT(CASE WHEN type = 'info' THEN 1 END) as info_count,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_count,
        COUNT(DISTINCT created_by) as alert_senders
      FROM notifications
      ${dateFilter}
    `;

    db.query(notificationsSql, values, (err, notificationData) => {
      if (err) {
        console.error("Error getting notifications report:", err);
        return res.status(500).json({ error: "Error generating report" });
      }

      reports.notifications = notificationData[0];

      // Users Report
      const usersSql = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN isBlocked = 0 THEN 1 END) as active_users,
          COUNT(CASE WHEN isBlocked = 1 THEN 1 END) as blocked_users
        FROM user
      `;

      db.query(usersSql, [], (err, userData) => {
        if (err) {
          console.error("Error getting users report:", err);
          return res.status(500).json({ error: "Error generating report" });
        }

        reports.users = userData[0];

        // Government Authorities Report
        const authoritiesSql = `
          SELECT 
            COUNT(*) as total_authorities,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_authorities,
            COUNT(DISTINCT department) as departments_count
          FROM government_authorities
        `;

        db.query(authoritiesSql, [], (err, authorityData) => {
          if (err) {
            console.error("Error getting authorities report:", err);
            return res.status(500).json({ error: "Error generating report" });
          }

          reports.authorities = authorityData[0];

          // Top Risk Locations
          const topRiskSql = `
            SELECT 
              location_name,
              pincode,
              risk_percentage,
              COUNT(*) as prediction_count,
              MAX(created_at) as last_prediction
            FROM risk_predictions
            ${dateFilter}
            GROUP BY location_name, pincode, risk_percentage
            ORDER BY risk_percentage DESC
            LIMIT 10
          `;

          db.query(topRiskSql, values, (err, topRiskData) => {
            if (err) {
              console.error("Error getting top risk locations:", err);
              return res.status(500).json({ error: "Error generating report" });
            }

            reports.top_risk_locations = topRiskData;

            // Notification Engagement
            const engagementSql = `
              SELECT 
                n.id,
                n.title,
                n.created_at,
                COUNT(DISTINCT unr.user_id) as read_count,
                (SELECT COUNT(*) FROM user WHERE isBlocked = 0) as total_users,
                ROUND((COUNT(DISTINCT unr.user_id) / (SELECT COUNT(*) FROM user WHERE isBlocked = 0)) * 100, 2) as read_percentage
              FROM notifications n
              LEFT JOIN user_notification_read unr ON n.id = unr.notification_id
              ${dateFilter ? `WHERE DATE(n.created_at) BETWEEN ? AND ?` : ""}
              GROUP BY n.id
              ORDER BY n.created_at DESC
              LIMIT 10
            `;

            db.query(engagementSql, values, (err, engagementData) => {
              if (err) {
                console.error("Error getting engagement report:", err);
                return res.status(500).json({ error: "Error generating report" });
              }

              reports.notification_engagement = engagementData;

              res.status(200).json({
                message: "Report generated successfully",
                report: reports,
                date_range: {
                  start_date: start_date || null,
                  end_date: end_date || null,
                },
                generated_at: new Date().toISOString(),
              });
            });
          });
        });
      });
    });
  });
};
