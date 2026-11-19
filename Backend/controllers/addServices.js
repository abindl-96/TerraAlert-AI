import db from '../config/db.js';


export const addUsers = (req, res) => {
  const { name, email, phone, district, pincode, password } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !district || !pincode || !password) {
    return res.status(400).json({
      error: 'All fields are required: name, email, phone, district, pincode, password',
      message: 'Please fill in all required fields'
    });
  }

  const sql = "INSERT INTO user (name, email, phone_number, location, district, pincode, password) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [name.trim(), email.trim(), phone.trim(), district, district, pincode.trim(), password];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error adding user:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists', message: 'This email is already registered. Please use a different email or login.' });
      }
      if (err.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        return res.status(400).json({ error: 'Missing required field', message: err.sqlMessage || 'Please provide all required fields.' });
      }
      return res.status(500).json({ error: 'Registration failed', message: err.message || 'Error adding user. Please try again.' });
    }
    console.log('user added successfully');
    res.status(200).json({ message: 'user added successfully' });
  });
}


export const addGuidlines = (req, res) => {
  const { title, description, type } = req.body;

  const sql = "INSERT INTO guidlines (title, description, type) VALUES (?, ?, ?)";
  const values = [title, description, type];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error adding guideline:", err);
      return res.status(500).json({ error: "Error adding guideline" });
    }

    res.status(200).json({ message: "Guideline added successfully" });
  });
};










export const addCategory = (req, res) => {
  const { name } = req.body;

  const sql = "INSERT INTO categories (name) VALUES (?)";
  console.log(name);
  const values = [name];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error adding category:', err);
      res.status(500).json({ error: 'Error adding category' });
      return;
    }
    console.log('category added successfully');
    res.status(200).json({ message: 'category added successfully' });
  });
}
export const addFeedback = (req, res) => {
  const { user_id, service_id, feedback } = req.body;
  const values = [user_id, service_id, feedback];
  console.log(values);
  const sql = `INSERT INTO feedbacks (user_id, service_id, feedback)  
               VALUES(?, ?, ?)`;
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error adding feedbacks:', err);
      res.status(500).json({ error: 'Error adding feedbacks' });
      return;
    }
    console.log('feedbacks added successfully');
    res.status(200).json({ message: 'feedbacks added successfully' });
  });
};

export const addRequest = (req, res) => {
  const { service, user_id } = req.body;
  const requestSql = "INSERT INTO requests (service, user_id) VALUES (?, ?)";
  const values = [service, user_id];

  db.query(requestSql, values, (err, result) => { // Change 'res' to 'result' here
    if (err) {
      console.error('Error adding invoice:', err);
      res.status(500).json({ error: 'Error adding invoice' });
      return;
    }
    console.log('service requested successfully');
    res.status(200).json({ message: 'service requested successfully' });
  });
};

export const addRiskPrediction = (req, res) => {
  const { location_name, latitude, longitude, risk_percentage, pincode, district, user_id } = req.body;

  // Validate required fields
  if (!location_name || latitude === undefined || longitude === undefined || risk_percentage === undefined) {
    return res.status(400).json({ error: 'Missing required fields: location_name, latitude, longitude, risk_percentage' });
  }

  const sql = "INSERT INTO risk_predictions (location_name, latitude, longitude, risk_percentage, pincode, district, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [location_name, latitude, longitude, risk_percentage, pincode || null, district || null, user_id || null];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error adding risk prediction:', err);
      res.status(500).json({ error: 'Error adding risk prediction' });
      return;
    }
    console.log('Risk prediction added successfully');
    res.status(200).json({
      message: 'Risk prediction added successfully',
      id: result.insertId
    });
  });
};

export const addGovernmentAuthority = (req, res) => {
  const { name, department, email, phone_number, password, address, district, state, pincode, designation, status } = req.body;

  // Validate required fields
  if (!name || !department || !email || !phone_number || !password) {
    return res.status(400).json({ error: 'Missing required fields: name, department, email, phone_number, password' });
  }

  const sql = "INSERT INTO government_authorities (name, department, email, phone_number, password, address, district, state, pincode, designation, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [name, department, email, phone_number, password, address || null, district || null, state || null, pincode || null, designation || null, status || 'active'];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error adding government authority:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Error adding government authority' });
      return;
    }
    console.log('Government authority added successfully');
    res.status(200).json({
      message: 'Government authority added successfully',
      id: result.insertId
    });
  });
};

export const sendGovernmentAlert = (req, res) => {
  const { authority_id, subject, message, risk_prediction_id, location_name, risk_percentage, priority, sent_by } = req.body;

  // Validate required fields
  if (!authority_id || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields: authority_id, subject, message' });
  }

  const sql = "INSERT INTO government_alerts (authority_id, subject, message, risk_prediction_id, location_name, risk_percentage, priority, sent_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [
    authority_id,
    subject,
    message,
    risk_prediction_id || null,
    location_name || null,
    risk_percentage || null,
    priority || 'medium',
    sent_by || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error sending alert:', err);
      res.status(500).json({ error: 'Error sending alert' });
      return;
    }
    console.log('Alert sent successfully');
    res.status(200).json({
      message: 'Alert sent successfully',
      id: result.insertId
    });
  });
};



