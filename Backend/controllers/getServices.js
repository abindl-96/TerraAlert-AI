import db from "../config/db.js";

export const getAllUsers = (req,res)=>{
    const sql = "SELECT * FROM user";
  
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ error: 'Error ' });
        return;
      }
      console.log('users retrieved');
      res.status(200).json({ data:result });
    });
}

export const getUserById = (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const sql = "SELECT id, name, email, phone_number, location, district, pincode, usertype, created_at FROM user WHERE id = ? AND isBlocked = 0";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error getting user:', err);
            return res.status(500).json({ error: 'Error fetching user' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ data: result[0] });
    });
}

export const getGuidlines = (req,res)=>{

    const sql = "Select * from guidlines";
  
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error getting guidlines:', err);
        res.status(500).json({ error: 'Error ' });
        return;
      }
      console.log('guidlines retrieved');
      res.status(200).json({ data:result });
    });
}











export const getAllCategory = (req,res)=>{
  const sql = "Select * from categories ";
  db.query(sql,(err, result) => {
    if (err) {
      console.error('Error getting products:', err);
      res.status(500).json({ error: 'Error ' });
      return;
    }
    console.log('category successfully fetched');
    res.status(200).json({ data:result });
  });
}

export const getAllStaffs = (req,res)=>{
    const sql = "Select * from user ";
    db.query(sql,(err, result) => {
      if (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ error: 'Error ' });
        return;
      }
      console.log('success');
      res.status(200).json({ data:result });
    });
}



export const getAllCategories = (req, res) => {
  const getAllInvoicesQuery = "SELECT * FROM categories";

  db.query(getAllInvoicesQuery, (error, results) => {
    if (error) {
      console.error('Error retrieving invoices:', error);
      res.status(500).json({ error: 'Error retrieving invoices' });
      return;
    }

    res.status(200).json({ data:results });
  });
}
export const getAllFeedbacks = (req, res) => {
  const getAllInvoicesQuery = "SELECT * FROM feedbacks";

  db.query(getAllInvoicesQuery, (error, results) => {
    if (error) {
      console.error('Error retrieving feedbacks:', error);
      res.status(500).json({ error: 'Error retrieving feedbacks' });
      return;
    }

    res.status(200).json({ data:results });
  });
}


export const getAllRequests = (req, res) => {
  const sql = "SELECT requests.*, categories.name AS service_name, user.name AS user_name FROM requests \
              LEFT JOIN categories ON requests.service = categories.id \
              LEFT JOIN user ON requests.user_id = user.id";

  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error retrieving requests:', error);
      res.status(500).json({ error: 'Error retrieving requests' });
      return;
    }

    res.status(200).json({ data: results });
  })
}

export const getRiskPredictions = (req, res) => {
  const sql = "SELECT * FROM risk_predictions ORDER BY created_at DESC";
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error getting risk predictions:', err);
      res.status(500).json({ error: 'Error getting risk predictions' });
      return;
    }
    console.log('Risk predictions retrieved');
    res.status(200).json({ data: result });
  });
};

export const getAllGovernmentAuthorities = (req, res) => {
  const sql = "SELECT * FROM government_authorities ORDER BY created_at DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error getting government authorities:', err);
      res.status(500).json({ error: 'Error getting government authorities' });
      return;
    }
    console.log('Government authorities retrieved');
    res.status(200).json({ data: result });
  });
};

export const getGovernmentAlerts = (req, res) => {
  const { authority_id } = req.query;
  
  let sql = `
    SELECT ga.*, 
           rp.latitude, rp.longitude, rp.pincode as risk_pincode,
           a.name as sent_by_name
    FROM government_alerts ga
    LEFT JOIN risk_predictions rp ON ga.risk_prediction_id = rp.id
    LEFT JOIN admin a ON ga.sent_by = a.id
  `;
  
  const values = [];
  
  if (authority_id) {
    sql += " WHERE ga.authority_id = ?";
    values.push(authority_id);
  }
  
  sql += " ORDER BY ga.created_at DESC";

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error getting government alerts:', err);
      res.status(500).json({ error: 'Error getting government alerts' });
      return;
    }
    console.log('Government alerts retrieved');
    res.status(200).json({ data: result });
  });
};

