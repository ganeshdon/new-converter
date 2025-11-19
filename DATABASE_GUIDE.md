# User Data Storage Guide

## 📊 Database Information

**Database:** MongoDB
**Database Name:** `test_database`
**Connection:** `mongodb://localhost:27017`
**Users Collection:** `users`

---

## 📋 Collections in Database

1. **users** - User accounts and profiles
2. **documents** - Converted documents
3. **subscriptions** - Subscription records
4. **payment_transactions** - Payment history
5. **user_sessions** - User sessions
6. **anonymous_conversions** - Anonymous user conversions

---

## 👥 Current Users Summary

**Total Users:** 17 users registered

**Sample User Data Structure:**
```json
{
  "_id": "uuid",
  "email": "user@example.com",
  "full_name": "User Name",
  "password_hash": "$2b$12$...",
  "subscription_tier": "daily_free",
  "pages_remaining": 7,
  "pages_limit": 7,
  "billing_cycle_start": "2025-10-05T13:02:50.633Z",
  "daily_reset_time": "2025-10-13T09:44:44.925Z",
  "language_preference": "en",
  "created_at": "2025-10-05T13:02:50.633Z",
  "updated_at": "2025-10-05T13:02:50.633Z"
}
```

---

## 🔍 Useful MongoDB Queries

### View All Users
```bash
mongosh test_database --eval "db.users.find().pretty()"
```

### Count Total Users
```bash
mongosh test_database --eval "db.users.countDocuments()"
```

### Find User by Email
```bash
mongosh test_database --eval "db.users.findOne({email: 'ganeshstudent02@gmail.com'})"
```

### View Only Emails and Names
```bash
mongosh test_database --eval "db.users.find({}, {email: 1, full_name: 1, subscription_tier: 1, _id: 0}).pretty()"
```

### Find Users by Subscription Tier
```bash
mongosh test_database --eval "db.users.find({subscription_tier: 'daily_free'}).pretty()"
```

### View Recent Users (Last 5)
```bash
mongosh test_database --eval "db.users.find().sort({created_at: -1}).limit(5).pretty()"
```

### Count Users by Subscription Tier
```bash
mongosh test_database --eval "db.users.aggregate([
  {$group: {_id: '$subscription_tier', count: {$sum: 1}}}
])"
```

### Delete a User (by email)
```bash
mongosh test_database --eval "db.users.deleteOne({email: 'test@example.com'})"
```

### Update User Subscription
```bash
mongosh test_database --eval "db.users.updateOne(
  {email: 'user@example.com'},
  {$set: {subscription_tier: 'professional', pages_limit: 1000, pages_remaining: 1000}}
)"
```

---

## 📑 View Other Collections

### View All Documents
```bash
mongosh test_database --eval "db.documents.find().pretty()"
```

### View All Subscriptions
```bash
mongosh test_database --eval "db.subscriptions.find().pretty()"
```

### View Payment Transactions
```bash
mongosh test_database --eval "db.payment_transactions.find().pretty()"
```

### View Anonymous Conversions
```bash
mongosh test_database --eval "db.anonymous_conversions.find().pretty()"
```

---

## 🛠️ Database Management

### Backup Database
```bash
mongodump --db test_database --out /tmp/mongodb_backup
```

### Restore Database
```bash
mongorestore --db test_database /tmp/mongodb_backup/test_database
```

### Export Users to JSON
```bash
mongoexport --db test_database --collection users --out /tmp/users.json --pretty
```

### Import Users from JSON
```bash
mongoimport --db test_database --collection users --file /tmp/users.json
```

---

## 🔐 Security Notes

- Passwords are hashed using bcrypt ($2b$ prefix)
- Never share password hashes
- User IDs are UUIDs (not MongoDB ObjectIds)
- Created and updated timestamps are tracked

---

## 📊 Current Statistics

**From your database:**
- Total Users: 17
- Free Tier Users: 16
- Basic Plan Users: 1
- Notable User: ganeshstudent02@gmail.com (registered)

---

## 🚀 Quick Access Commands

### Interactive MongoDB Shell
```bash
mongosh test_database
```

Then run queries directly:
```javascript
db.users.find({})
db.users.countDocuments()
db.getCollectionNames()
```

### GUI Tools (Alternative)
- **MongoDB Compass** - Download from mongodb.com
- **Studio 3T** - Free for non-commercial use
- **Robo 3T** - Lightweight GUI

---

## 📍 Location Details

**Backend Code:** `/app/backend/server.py`
**Database Config:** `/app/backend/.env`
**Models:** `/app/backend/models.py`

**Connection String:** `mongodb://localhost:27017`
**Database Name:** `test_database`
**Collections:** 6 collections (users, documents, subscriptions, etc.)

---

Need to modify or query specific data? Use the commands above or let me know what you need!
