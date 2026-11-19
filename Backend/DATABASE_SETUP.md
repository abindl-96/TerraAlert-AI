# TerraAlert AI - Database Setup Guide

## Quick Setup

1. **Create the database:**
   ```sql
   CREATE DATABASE terraalertai;
   ```

2. **Run the SQL schema file:**
   ```bash
   mysql -u root -p terraalertai < database_schema.sql
   ```
   
   Or import it through phpMyAdmin/MySQL Workbench.

## Database Structure

### Tables Created:

1. **user** - Regular users (from registration)
   - Fields: id, name, email, phone_number, location, pincode, password, usertype, isBlocked

2. **admin** - Admin users
   - Fields: id, email, password, name

3. **categories** - Service categories
   - Fields: id, name

4. **guidlines** - Safety guidelines
   - Fields: id, title, description, type

5. **requests** - Service requests
   - Fields: id, service, user_id, status

6. **feedbacks** - User feedbacks
   - Fields: id, user_id, service_id, feedback

## Default Admin Account

After running the schema, a default admin account is created:
- **Email:** admin@terraalert.com
- **Password:** admin123

**⚠️ IMPORTANT:** Change this password in production!

## API Endpoints

### Authentication Routes (`/api/auth`):
- `POST /api/auth/UserLogin` - User login
- `POST /api/auth/AdminLogin` - Admin login

### Add Routes (`/api/add`):
- `POST /api/add/adduser` - Register new user
- `POST /api/add/addGuidlines` - Add guideline
- `POST /api/add/addCategory` - Add category
- `POST /api/add/addRequest` - Add request (requires user_id)
- `POST /api/add/addFeedback` - Add feedback (requires user_id)

## Testing the Setup

1. **Test Registration:**
   ```bash
   POST http://localhost:8081/api/add/adduser
   Body: {
     "name": "Test User",
     "email": "test@example.com",
     "phone": "1234567890",
     "location": "Test Location",
     "pincode": "123456",
     "password": "password123"
   }
   ```

2. **Test User Login:**
   ```bash
   POST http://localhost:8081/api/auth/UserLogin
   Body: {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Test Admin Login:**
   ```bash
   POST http://localhost:8081/api/auth/AdminLogin
   Body: {
     "email": "admin@terraalert.com",
     "password": "admin123"
   }
   ```

## Migration: Add District Columns

To support Kerala districts and district-wise alerts, run:

```bash
mysql -u root -p terraalertai < Backend/migrations/add_district_columns.sql
```

Or run manually:
```sql
ALTER TABLE user ADD COLUMN district VARCHAR(100) AFTER location;
ALTER TABLE risk_predictions ADD COLUMN district VARCHAR(100) AFTER pincode;
ALTER TABLE notifications ADD COLUMN district VARCHAR(100) AFTER pincode;
```

## Notes

- All passwords are stored in plain text (for development only)
- In production, implement password hashing (bcrypt recommended)
- Update database credentials in `Backend/config/db.js`
