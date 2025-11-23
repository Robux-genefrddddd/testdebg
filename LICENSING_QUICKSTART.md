# 🚀 Licensing System - Quick Start Guide

## 1. Initial Setup (Already Done ✅)

Firebase credentials have been configured in the environment:

- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID
- Measurement ID
- OpenRouter API Key

## 2. First Time Users

### What Happens When User Registers:

1. They create account with email/password (Firebase Auth)
2. Device fingerprint is automatically generated
3. They start with **Gratuit (Free)** plan
4. Free plan = **10 messages** (one-time, non-resetting)
5. After 10 messages, they see activation popup

### How to Activate a License:

**Step 1: Admin generates license**

- Press **CTRL+F1** in the app (admin only)
- Go to "Licences" tab
- Enter user email
- Select plan (Classic or Pro)
- Set duration (1-365 days)
- Click "Générer une clé"
- Share the key with user

**Step 2: User enters license key**

- Click "Entrer une clé" button in the popup
- Paste the license key
- System validates and activates
- They now have full access to their plan

## 3. User Plans

| Plan       | Messages/Day  | Cost         | Duration       |
| ---------- | ------------- | ------------ | -------------- |
| 🆓 Gratuit | 10 (one-time) | Free         | Forever        |
| ⭐ Classic | 1,000         | Configurable | 1 day - 1 year |
| 🚀 Pro     | 5,000         | Configurable | 1 day - 1 year |

## 4. Admin Panel Features (CTRL+F1)

### 📊 Dashboard

- See total users, active subscriptions, and usage stats

### 🔑 License Management

- Generate new license keys
- Keys are 32-character hex strings
- Auto-formatted as XXXX-XXXX-XXXX...
- Copy to clipboard with one click

### 👥 User Management

- **Warn**: Send warning message to user
- **Suspend**: Lock account for 7 days (configurable)
- **Ban**: Permanently ban account
- **Unban/Reactivate**: Remove restrictions

### 🔧 Maintenance Mode

- Toggle maintenance on/off
- Custom message displayed to users
- Only admins can access during maintenance
- Perfect for deployments or updates

## 5. Message Counter Logic

### Free Plan (Gratuit)

- **10 messages total** - one-time limit
- No daily reset
- Once limit reached, must upgrade

### Classic/Pro Plans

- **Daily reset** at 00:00 UTC
- Counter automatically resets every day
- Shows "450/1000 messages used today"
- Expires on configured date

## 6. License Expiration Flow

### 7 Days Before

- ⚠️ Yellow warning banner appears
- "Votre licence expire dans 7 jour(s)"
- User can dismiss but will keep seeing it

### Day of Expiration

- 🔴 Critical red modal appears
- Impossible to dismiss
- User cannot send messages
- Must renew license to continue

### After Expiration

- Modal stays until license renewed
- Clicking modal shows renewal options
- User can enter new license key
- Access restored immediately

## 7. Anti-Bypass Features

The system prevents:

- ❌ DevTools/Inspector access
- ❌ Incognito mode usage
- ❌ localStorage modification
- ❌ VPN/Proxy bypass
- ❌ eval() execution
- ❌ User-Agent spoofing
- ❌ URL manipulation

## 8. Common Tasks

### Generate a License for a User

1. Press CTRL+F1
2. Click "Licences" tab
3. Enter email: `user@example.com`
4. Select: Classic (⭐)
5. Duration: 30 days
6. Click "Générer une clé"
7. Copy the key
8. Send to user: "Enter this key: XXXX-XXXX-..."

### Warn a User (Without Banning)

1. Press CTRL+F1
2. Click "Utilisateurs" tab
3. Enter email: `user@example.com`
4. Action: "Avertir"
5. Reason: "Excessive use of service"
6. Click "Appliquer l'action"

### Temporarily Suspend Account

1. Press CTRL+F1
2. Click "Utilisateurs" tab
3. Enter email: `user@example.com`
4. Action: "Suspendre"
5. Reason: "Maintenance check required"
6. Click "Appliquer l'action"

- Account locked for 7 days
- User sees "Compte Suspendu" modal
- Auto-reactivates after 7 days

### Enable Maintenance Mode

1. Press CTRL+F1
2. Click "Maintenance" tab
3. Message: "We're upgrading our servers..."
4. Click "Activer"

- All users see maintenance overlay
- Site is completely blocked
- Admins can still access

## 9. Firestore Data Structure

When you look at Firestore, you'll see:

```
users/
├── user123/
│   ├── email: "user@example.com"
│   ├── name: "John"
│   ├── plan: "Classic"
│   ├── messageCount: 450
│   ├── messageLimit: 1000
│   ├── isBanned: false
│   └── license/ (subcollection)
│       └── current/
│           ├── plan: "Classic"
│           ├── expiresAt: "2025-02-15T..."
│           ├── messageCount: 450
│           └── licenseKey: "XXXX..."

licenseKeys/
├── key1/ (one per generated key)
│   ├── key: "XXXX..."
│   ├── plan: "Classic"
│   ├── email: "user@example.com"
│   ├── expiresAt: "2025-02-15T..."
│   ├── isActive: true
│   └── usedBy: "user123"
```

## 10. Testing the System

### Test Free Plan

1. Register new account
2. Try to send 11 messages
3. Should block after 10th message
4. Should show activation popup

### Test License Activation

1. Admin generates license for test user
2. Logged-in user clicks activation button
3. Enters license key
4. Should activate immediately
5. Message limit should update

### Test License Expiration

1. Create license with 1-day duration
2. Wait or manually adjust database
3. After expiration:
   - Modal should appear
   - Messages should be blocked
   - User must renew to continue

### Test Admin Actions

1. Admin warns user
2. User should see warning alert
3. Admin bans user
4. User cannot send messages
5. User sees "Compte Banni" modal

## 11. Troubleshooting

### "License verification failed"

- Check Firebase is initialized
- Verify API keys in env variables
- Check browser console for errors
- Clear browser cache

### Message counter not incrementing

- Check `/api/license/increment` endpoint
- Verify Firestore rules allow updates
- Check user ID matches in database
- Monitor network tab in DevTools

### Admin panel won't open

- Must be logged in as: `founder@example.com`
- Press CTRL+F1 (exact key combination)
- Check browser console for JavaScript errors
- Verify admin email matches in code

### License key invalid

- Ensure correct format (with hyphens)
- Verify key is in Firestore `licenseKeys` collection
- Check `isActive: true` in database
- Ensure email matches

## 12. Key Files to Know

| File                                  | Purpose              |
| ------------------------------------- | -------------------- |
| `client/lib/licenseManager.ts`        | License API calls    |
| `client/components/LicensePopups.tsx` | Alert system         |
| `client/pages/AdminPanel.tsx`         | Admin interface      |
| `client/context/AuthContext.tsx`      | License integration  |
| `server/routes/license.ts`            | Backend verification |
| `server/routes/admin.ts`              | Admin operations     |
| `shared/api.ts`                       | Type definitions     |

## 13. Next Steps

1. **Test the system**:
   - Register a test user
   - Try sending messages
   - Generate a license
   - Test activation

2. **Customize**:
   - Change admin email in code
   - Adjust message limits
   - Modify popup messages
   - Personalize themes

3. **Deploy**:
   - Set environment variables
   - Run `pnpm build`
   - Deploy to Netlify/Vercel
   - Configure Firestore rules

4. **Monitor**:
   - Watch admin dashboard
   - Check error logs
   - Monitor license usage
   - Track user activity

## 14. License Key Format

All generated keys follow this format:

```
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  (32 hex characters)
```

Displayed as:

```
XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
```

Example:

```
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
Displayed as: A1B2-C3D4-E5F6-A7B8-C9D0-E1F2-A3B4-C5D6
```

## 15. Messages & Localization

All user messages are in **French**:

- "Licence Expirée" - License expired
- "Compte Banni" - Account banned
- "Compte Suspendu" - Account suspended
- "Avertissement" - Warning
- "Gratuit" - Free
- "Classic" - Classic plan
- "Pro" - Pro plan

To change language, edit message strings in:

- `client/components/LicensePopups.tsx`
- `client/components/LicenseActivationModal.tsx`
- `shared/api.ts`

---

**Ready to go!** 🎉

Your licensing system is fully operational. Press CTRL+F1 to access the admin panel and start managing licenses!
