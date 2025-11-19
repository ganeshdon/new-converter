# 📊 Database Export Summary

## ✅ CSV Files Created Successfully

All user and transaction data has been exported to CSV files in `/app/` directory.

---

## 📁 Exported Files

### 1. **users_data.csv**
- **Records:** 17 users
- **Location:** `/app/users_data.csv`
- **Fields:** User ID, Email, Full Name, Subscription Tier, Pages Remaining, Pages Limit, Language, Created At, Updated At

### 2. **documents_data.csv**
- **Records:** 2 documents
- **Location:** `/app/documents_data.csv`
- **Fields:** Document ID, User ID, Filename, File Size, Page Count, Pages Deducted, Conversion Date, Download Count, Status

### 3. **subscriptions_data.csv**
- **Records:** 6 subscriptions
- **Location:** `/app/subscriptions_data.csv`
- **Fields:** User ID, Subscription ID, Plan, Billing Interval, Status, Payment Provider, Created At, Updated At

### 4. **payment_transactions.csv**
- **Records:** 8 transactions
- **Location:** `/app/payment_transactions.csv`
- **Fields:** Transaction ID, User ID, Email, Package ID, Amount, Currency, Payment Status, Subscription Status, Billing Interval, Created At, Updated At

---

## 📥 How to Download

### Option 1: Direct File Access
Files are located in `/app/` directory:
- `/app/users_data.csv`
- `/app/documents_data.csv`
- `/app/subscriptions_data.csv`
- `/app/payment_transactions.csv`

### Option 2: Copy to Local Directory
```bash
# Copy all CSV files to your desired location
cp /app/*.csv /path/to/your/folder/
```

### Option 3: View in Terminal
```bash
# View users data
cat /app/users_data.csv

# View with column formatting
column -t -s, /app/users_data.csv | less
```

---

## 📊 Data Summary

### Users (17 total)
- **Free Tier:** 16 users
- **Basic Plan:** 1 user (jane.doe.test2@example.com)
- **Notable User:** ganeshstudent02@gmail.com (GANESH S)

### Documents (2 total)
- Converted bank statements
- User: ganeshstudent02@gmail.com
- Status: Completed

### Subscriptions (6 total)
- Payment provider: Dodo Payments
- Various plans and billing intervals
- Status tracking included

### Transactions (8 total)
- Payment records
- Including pending and completed transactions
- Amount tracking in USD

---

## 🔄 Re-Export Commands

If you need to export data again:

```bash
# Export users
mongoexport --db test_database --collection users --type=csv \
  --fields _id,email,full_name,subscription_tier,pages_remaining,pages_limit,language_preference,created_at,updated_at \
  --out /app/users_data.csv

# Export documents
mongoexport --db test_database --collection documents --type=csv \
  --fields _id,user_id,original_filename,file_size,page_count,pages_deducted,conversion_date,download_count,status \
  --out /app/documents_data.csv

# Export subscriptions
mongoexport --db test_database --collection subscriptions --type=csv \
  --fields user_id,subscription_id,plan,billing_interval,status,payment_provider,created_at,updated_at \
  --out /app/subscriptions_data.csv

# Export transactions
mongoexport --db test_database --collection payment_transactions --type=csv \
  --fields transaction_id,user_id,email,package_id,amount,currency,payment_status,subscription_status,billing_interval,created_at,updated_at \
  --out /app/payment_transactions.csv
```

---

## 📈 Quick Stats

| Collection | Records | File Size |
|------------|---------|-----------|
| Users | 17 | ~2 KB |
| Documents | 2 | ~1 KB |
| Subscriptions | 6 | ~1 KB |
| Transactions | 8 | ~2 KB |

---

## 🔍 Data Preview

### Sample User Record:
```
_id,email,full_name,subscription_tier,pages_remaining,pages_limit,language_preference,created_at,updated_at
f72cc9e9-fcd8-479d-ae98-8a4993300524,ganeshstudent02@gmail.com,GANESH S,daily_free,7,7,en,2025-10-05T14:04:59.898Z,2025-10-05T14:04:59.898Z
```

### Sample Transaction Record:
```
transaction_id,user_id,email,package_id,amount,currency,payment_status
27ef5a9c-aa3a-4c43-8d9f-e66eecf1691c,f72cc9e9...,ganeshstudent02@gmail.com,starter,15,usd,pending
```

---

## 📧 User Emails List

Extracted email addresses from users_data.csv:
1. test@example.com
2. ganeshstudent02@gmail.com ⭐
3. jane.doe.test2@example.com (Basic Plan)
4. testpayment@example.com
5. Multiple test users (existing.*.@example.com)

---

## 🛠️ Import Back to Database

If you need to import data back:

```bash
# Import users
mongoimport --db test_database --collection users \
  --type csv --headerline --file /app/users_data.csv

# Import documents
mongoimport --db test_database --collection documents \
  --type csv --headerline --file /app/documents_data.csv

# Import subscriptions
mongoimport --db test_database --collection subscriptions \
  --type csv --headerline --file /app/subscriptions_data.csv

# Import transactions
mongoimport --db test_database --collection payment_transactions \
  --type csv --headerline --file /app/payment_transactions.csv
```

---

## ✅ Export Complete!

All CSV files are ready for download from `/app/` directory.

**Files:**
- ✅ users_data.csv (17 records)
- ✅ documents_data.csv (2 records)
- ✅ subscriptions_data.csv (6 records)
- ✅ payment_transactions.csv (8 records)

You can now download these files or use them for analysis, backup, or migration purposes!
