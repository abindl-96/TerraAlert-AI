import db from "../config/db.js";


export const deleteGuidline = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM guidlines WHERE id = ?";
    const values = [id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error deleting guidlines:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        console.log('guidlines deleted');
        res.status(200).json({ message: "guidlines deleted successfully" });
    });
};










export const deleteCategory = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM categories WHERE id = ?";
    const values = [id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error deleting Category:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        console.log('Category deleted');
        res.status(200).json({ message: "Category deleted successfully" });
    });
};

export const deleteGovernmentAuthority = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM government_authorities WHERE id = ?";
    const values = [id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error deleting government authority:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        console.log('Government authority deleted');
        res.status(200).json({ message: "Government authority deleted successfully" });
    });
};




