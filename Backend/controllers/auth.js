import db from "../config/db.js";

export const Adminlogin = (req, res) => {
    const { email, password } = req.body;
    console.log("hyeeeee");
    const sql = "SELECT * FROM admin WHERE email = ? AND password = ?";
    const values = [email, password];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            res.status(500).json({ error: 'Error during login' });
            return;
        }

        if (results.length === 0) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const user = results[0];
        res.status(200).json({ message: 'Login successful', user });
        console.log("Admin Login successfull",user);
    });
};

export const Userlogin = (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM user WHERE email = ? AND password = ? AND isBlocked = 0";
    const values = [email, password];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            res.status(500).json({ error: 'Error during login' });
            return;
        }

        if (results.length === 0) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const user = results[0];
        res.status(200).json({ message: 'Login successful', user });
        console.log("User Login successfull",user);
    });
};

export const GovernmentLogin = (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM government_authorities WHERE email = ? AND password = ? AND status = 'active'";
    const values = [email, password];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error during government login:', err);
            res.status(500).json({ error: 'Error during login' });
            return;
        }

        if (results.length === 0) {
            res.status(401).json({ error: 'Invalid email or password, or account is inactive' });
            return;
        }

        const authority = results[0];
        // Remove password from response for security
        const { password: _, ...authorityWithoutPassword } = authority;
        res.status(200).json({ 
            message: 'Login successful', 
            user: authorityWithoutPassword,
            userType: 'government'
        });
        console.log("Government Authority Login successful", authorityWithoutPassword);
    });
};