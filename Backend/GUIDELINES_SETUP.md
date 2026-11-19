# Guidelines Database Setup

## Overview
This document explains how to add sample guidelines to the TerraAlert database.

## Guidelines Structure

The guidelines are organized into three types:
1. **before** - Prevention guidelines (what to do before a landslide)
2. **during** - Response guidelines (what to do during a landslide)
3. **after** - Recovery guidelines (what to do after a landslide)

## Setup Methods

### Method 1: Using the Updated Schema File (Recommended)
The `database_schema.sql` file now includes sample guidelines. When you run the schema file, the guidelines will be automatically inserted.

```bash
mysql -u root -p terraalertai < database_schema.sql
```

### Method 2: Using the Separate Guidelines File
If you've already set up the database and just want to add guidelines:

```bash
mysql -u root -p terraalertai < insert_guidelines.sql
```

### Method 3: Manual Insert via MySQL Command Line
```bash
mysql -u root -p terraalertai
```
Then run the INSERT statements from `insert_guidelines.sql`

### Method 4: Using phpMyAdmin or MySQL Workbench
1. Open phpMyAdmin or MySQL Workbench
2. Select the `terraalertai` database
3. Go to the SQL tab
4. Copy and paste the INSERT statements from `insert_guidelines.sql`
5. Execute the queries

## Guidelines Included

### Before Landslide (7 guidelines)
- Monitor Weather Conditions
- Inspect Your Property Regularly
- Maintain Proper Drainage
- Avoid Building on Steep Slopes
- Plant Vegetation on Slopes
- Prepare an Emergency Kit
- Create an Evacuation Plan

### During Landslide (6 guidelines)
- Evacuate Immediately
- Stay Away from Slopes
- Listen for Warning Signs
- Avoid Low-Lying Areas
- Do Not Return to Evacuated Areas
- Stay Informed

### After Landslide (8 guidelines)
- Wait for Official Clearance
- Check for Injuries
- Avoid Damaged Buildings
- Watch for Additional Slides
- Document Damage
- Check Utilities
- Seek Professional Help
- Support Community Recovery

**Total: 21 guidelines**

## Verifying the Insert

After running the SQL, you can verify the guidelines were inserted:

```sql
-- Check total count
SELECT COUNT(*) as total_guidelines FROM guidlines;

-- Check by type
SELECT type, COUNT(*) as count 
FROM guidlines 
GROUP BY type;

-- View all guidelines
SELECT * FROM guidlines ORDER BY type, id;
```

## Managing Guidelines via Admin Dashboard

Once the guidelines are in the database, you can:
- View all guidelines in the Admin Dashboard → Guidelines section
- Add new guidelines using the "Add Guideline" button
- Edit existing guidelines by clicking the edit icon
- Delete guidelines by clicking the delete icon

## API Endpoints

- **Get Guidelines:** `GET http://localhost:8081/api/get/getGuidlines`
- **Add Guideline:** `POST http://localhost:8081/api/add/addGuidlines`
- **Update Guideline:** `PUT http://localhost:8081/api/update/updateGuidlines/:id`
- **Delete Guideline:** `DELETE http://localhost:8081/api/delete/deleteGuidline/:id`

## Notes

- The `ON DUPLICATE KEY UPDATE` clause prevents duplicate entries if you run the script multiple times
- Guidelines are organized by type for easy filtering in the frontend
- You can add more guidelines through the admin dashboard or by modifying the SQL files
