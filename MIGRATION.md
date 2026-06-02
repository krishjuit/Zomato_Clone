# Migration Guide: Superadmin Registration Security & Seeding

This guide details the security updates implemented to disable public registration of the `superadmin` role, and the configuration steps required for environment-based seeding.

---

## 1. Registration Security Modifications
To prevent unauthorized access to the superadmin control panel:
- The public registration endpoint (`POST /api/user/register`) now restricts allowed roles to `customer` and `vendor`.
- Any registration request containing `role: "superadmin"` will be rejected immediately with a `400 Bad Request` and the message: `"Registration of Superadmin role is not permitted"`.
- Existing superadmins are **unaffected** by this change; login operations remain unchanged, allowing previously registered superadmins to continue using the system normally.

---

## 2. Environment Variables Configuration
The database bootstrap script (`db.js`) has been updated to automatically verify that at least one superadmin exists in the database on startup. If no superadmin exists, the system automatically creates the first superadmin from environment variables.

To configure this seeding, add the following variables to your backend `.env` file:

```env
SUPERADMIN_EMAIL=admin@zomato.com
SUPERADMIN_PASSWORD=strongPassword123
```

- If these variables are not provided, the seeding logic will fallback to `superadmin@zomato.com` and `admin123`.
- Once a superadmin is present in the database, the seeding is skipped on subsequent startups.

---

## 3. Migration Action Steps

1. **Update Environment Files**:
   Add `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` to your local and production backend environment configurations.
   
2. **Deploy Codebase Updates**:
   Deploy the updated `userController.js` and `db.js`.

3. **Restart backend server**:
   When the server boots, check console logs to verify superadmin status:
   - If no superadmin exists, you will see:
     `No superadmin account found. Auto-creating first superadmin...`
   - If a superadmin is already present, you will see:
     `Superadmin account(s) present in database. Seeding skipped.`
