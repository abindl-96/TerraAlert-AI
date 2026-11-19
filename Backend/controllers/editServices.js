import db from "../config/db.js";


export const updateUser = (req, res) => {
    const id = req.params.id || req.body.id;
    const { name, email, phone_number, location, district, pincode, password, usertype } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    let sql, values;
    if (password && password.trim() !== '') {
        sql = `UPDATE user SET name = ?, email = ?, phone_number = ?, location = ?, district = ?, pincode = ?, password = ?, usertype = ? WHERE id = ?`;
        values = [name, email, phone_number, location, district || null, pincode || null, password, usertype || 'user', id];
    } else {
        sql = `UPDATE user SET name = ?, email = ?, phone_number = ?, location = ?, district = ?, pincode = ?, usertype = ? WHERE id = ?`;
        values = [name, email, phone_number, location, district || null, pincode || null, usertype || 'user', id];
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Email already exists' });
            }
            return res.status(500).json({ error: 'Error updating user' });
        }
        console.log('User updated successfully');
        res.status(200).json({ message: 'User updated successfully' });
    });
};

export const blockUser = (req, res) => {
    const id = req.params.id;

    const sql = "UPDATE user SET isBlocked = 1 WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error blocking user" });
        }
        return res.status(200).json({ message: "User blocked successfully" });
    });
};


export const unblockUser = (req, res) => {
    const id = req.params.id;

    const sql = "UPDATE user SET isBlocked = 0 WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Serverside error" });
        }
        return res.status(200).json({ message: "User unblocked" });
    });
};

export const updateGuidlines = (req, res) => {
    const { id, title, description } = req.body;

    const sql = `
        UPDATE guidlines 
        SET title = ?, description = ?
        WHERE id = ?
    `;

    const values = [title, description, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating guidline:', err);
            res.status(500).json({ error: 'Error updating guidline' });
            return;
        }
        console.log('guidline updated successfully');
        res.status(200).json({ message: 'guidline updated successfully' });
    });
};










export const updateCategory = (req, res) => {
    const { id, name } = req.body;

    const sql = "UPDATE categories SET name = ? WHERE id = ?";
    const values = [name, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating category:', err);
            res.status(500).json({ error: 'Error updating category' });
            return;
        }
        console.log('category updated successfully');
        res.status(200).json({ message: 'category updated successfully' });
    });
}

export const updateRequest = (req, res) => {
    const { id } = req.params;
    const { reqStatus } = req.body;

    const sql = "UPDATE requests SET status = ? WHERE id = ?";
    const values = [reqStatus, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating request:', err);
            res.status(500).json({ error: 'Error updating request' });
            return;
        }
        console.log('Request updated successfully');
        res.status(200).json({ message: 'Request updated successfully' });
    });
};

export const updateGovernmentAuthority = (req, res) => {
    const id = req.params.id || req.body.id;
    const { name, department, email, phone_number, password, address, district, state, pincode, designation, status } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    // If password is provided, update it; otherwise keep existing password
    let sql, values;
    if (password && password.trim() !== '') {
        sql = `
            UPDATE government_authorities 
            SET name = ?, department = ?, email = ?, phone_number = ?, password = ?, address = ?, 
                district = ?, state = ?, designation = ?, status = ?
            WHERE id = ?
        `;
        values = [name, department, email, phone_number, password, address || null, district || null, state || null, designation || null, status || 'active', id];
    } else {
        sql = `
            UPDATE government_authorities 
            SET name = ?, department = ?, email = ?, phone_number = ?, address = ?, 
                district = ?, state = ?, designation = ?, status = ?
            WHERE id = ?
        `;
        values = [name, department, email, phone_number, address || null, district || null, state || null, designation || null, status || 'active', id];
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating government authority:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Email already exists' });
            }
            res.status(500).json({ error: 'Error updating government authority' });
            return;
        }
        console.log('Government authority updated successfully');
        res.status(200).json({ message: 'Government authority updated successfully' });
    });
};

export const markAlertAsRead = (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE government_alerts SET status = 'read', read_at = NOW() WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error marking alert as read:', err);
            res.status(500).json({ error: 'Error marking alert as read' });
            return;
        }
        console.log('Alert marked as read');
        res.status(200).json({ message: 'Alert marked as read' });
    });
};
