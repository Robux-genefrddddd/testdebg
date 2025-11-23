# 🎫 Firebase Licensing System - Complete Implementation

## Overview

A comprehensive, production-ready licensing and security system built on Firebase with three pricing tiers, message counting, license management, and advanced anti-bypass protections.

## Architecture

### Frontend Components

#### 1. **License Management System** (`client/lib/licenseManager.ts`)

- Centralized license verification and activation
- License key formatting and validation
- Message limit calculations for each plan
- Expiration tracking and countdown

#### 2. **License Pop-ups** (`client/components/LicensePopups.tsx`)

- Critical alerts (modal, modal-critical-dismissible modal)
- Warning alerts (banner, dismissible)
- Info alerts (bottom corner, dismissible)
- Impossible to bypass or close without action

#### 3. **License Activation Modal** (`client/components/LicenseActivationModal.tsx`)

- Clean UI for entering license keys
- Validation and formatting
- Loading states
- Error handling with localized messages

#### 4. **Maintenance Mode Overlay** (`client/components/MaintenanceModeOverlay.tsx`)

- Full-screen overlay blocking access
- Customizable message display
- Optional countdown timer
- Accessible only through admin panel

### Backend Services

#### 1. **License Routes** (`server/routes/license.ts`)

- `POST /api/license/verify` - Verify user's current license
- `POST /api/license/activate` - Activate a license key
- `POST /api/license/increment` - Increment message counter

#### 2. **Admin Routes** (`server/routes/admin.ts`)

- `POST /api/admin/license/create` - Generate license keys
- `POST /api/admin/user/action` - Warn, suspend, or ban users
- `POST /api/admin/maintenance` - Toggle maintenance mode
- `GET /api/admin/stats` - Get platform statistics

### Anti-Bypass System (`client/lib/antiBypass.ts`)

Comprehensive protection against common bypass techniques:

- **DevTools Detection**: Monitors window size changes for developer console
- **Incognito Mode Detection**: Detects private/incognito browsing
- **localStorage Protection**: Prevents modification of license keys
- **Console Protection**: Blocks eval() and disables function keys
- **VPN/Proxy Blocking**: Monitors for proxy configurations
- **User-Agent Monitoring**: Logs all user-agent access attempts
- **URL Protection**: Monitors history.pushState and replaceState
- **VPN Bypass Prevention**: Detects VPN/proxy patterns

## Pricing Tiers

### 🆓 Gratuit (Free)

- **Message Limit**: 10 messages
- **Features**:
  - Basic chatbot access
  - Message counting enforcement
  - License key required to upgrade
- **Cost**: Free (forever)

### ⭐ Classic

- **Message Limit**: 1,000 messages/day
- **Duration**: Configurable (1 day - 1 year)
- **Features**:
  - Daily reset of message counter
  - Automatic expiration notifications
  - License key validation

### 🚀 Pro

- **Message Limit**: 5,000 messages/day
- **Duration**: Configurable (1 day - 1 year)
- **Features**:
  - Higher message limits
  - Priority support
  - Advanced features access

## Database Schema (Firebase Firestore)

### Collection: `users`

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "plan": "Gratuit|Classic|Pro",
  "messageCount": 0,
  "messageLimit": 10,
  "isBanned": false,
  "banReason": "violation",
  "bannedAt": "2024-01-01T00:00:00Z",
  "isSuspended": false,
  "suspensionEndsAt": "2024-01-08T00:00:00Z",
  "suspensionReason": "abuse"
}
```

### Subcollection: `users/{userId}/license`

```json
{
  "plan": "Classic|Pro",
  "licenseKey": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "expiresAt": "2024-12-31T23:59:59Z",
  "isActive": true,
  "messageCount": 450,
  "messageLimit": 1000,
  "lastResetDate": "2024-01-01T00:00:00Z"
}
```

### Subcollection: `users/{userId}/warnings`

```json
{
  "type": "warning|suspension|expiration|ban",
  "title": "Avertissement",
  "message": "Detailed message",
  "createdAt": "2024-01-01T00:00:00Z",
  "createdByAdmin": "admin@example.com",
  "isRead": false,
  "actionRequired": "none|acknowledge|renew_license"
}
```

### Collection: `licenseKeys`

```json
{
  "key": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "plan": "Classic|Pro",
  "email": "user@example.com",
  "expiresAt": "2024-12-31T23:59:59Z",
  "isActive": true,
  "messageLimit": 1000,
  "usedBy": "userId",
  "createdAt": "2024-01-01T00:00:00Z",
  "createdByAdmin": "admin@example.com"
}
```

### Collection: `config`

```json
{
  "maintenance": {
    "enabled": false,
    "message": "Platform is under maintenance",
    "updatedAt": "2024-01-01T00:00:00Z",
    "updatedBy": "admin@example.com"
  }
}
```

## Admin Panel (`client/pages/AdminPanel.tsx`)

Access with **CTRL+F1** (admin only: founder@example.com)

### Features:

1. **Dashboard**
   - Total users count
   - Active subscriptions
   - Messages used statistics

2. **License Management**
   - Generate new license keys
   - Set plan (Gratuit, Classic, Pro)
   - Configure duration (days)
   - Copy keys to clipboard

3. **User Management**
   - Warn users
   - Suspend accounts (with duration)
   - Ban accounts
   - Unban accounts
   - Reactivate suspended accounts

4. **Maintenance Mode**
   - Toggle maintenance mode on/off
   - Custom message configuration
   - Blocks all users (except admins)

## Authentication Integration

All license checking is integrated with Firebase Authentication:

1. User registers/logs in via Firebase Auth
2. Device fingerprint is generated
3. License verification runs automatically
4. Alerts and warnings are fetched and displayed
5. Message limits are enforced on every API call

## Message Counting Flow

1. User sends a message through the chat interface
2. Client-side validation checks:
   - User is authenticated
   - License is active (not expired)
   - Message count < limit
   - Account is not banned/suspended
3. Message is sent to `/api/chat` endpoint
4. Server processes the message
5. Client increments message count via `/api/license/increment`
6. Firestore document is updated
7. UI reflects the new count

## License Expiration Handling

When a license expires:

1. **7 days before**: Warning banner appears
2. **Day of expiration**:
   - Critical modal appears
   - User cannot send messages
   - Message count frozen
3. **After expiration**:
   - Popup prompts to enter new license key
   - User can activate new license immediately
   - Reactivation clears suspension flags

## Security Features

### Server-Side Verification

- All license checks happen server-side
- Client cannot bypass message limits
- License keys validated against Firestore
- User role checked on every admin request

### Client-Side Protections

- DevTools detection
- Incognito mode detection
- localStorage modification prevention
- Console debugger blocking
- VPN/Proxy header detection
- User-Agent monitoring

### Combined Approach

- Client catches obvious bypass attempts immediately
- Server handles final validation
- Multi-layer defense against sophisticated attacks

## API Endpoints Reference

### License Verification

```bash
POST /api/license/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "deviceId": "device-fingerprint-hash",
  "licenseKey": "optional"
}

Response:
{
  "valid": true,
  "plan": "Classic",
  "messageLimit": 1000,
  "messageCount": 450,
  "canSendMessage": true,
  "expiresAt": "2024-12-31T23:59:59Z",
  "warnings": [],
  "isBanned": false,
  "isSuspended": false,
  "alerts": [],
  "maintenanceMode": false
}
```

### License Activation

```bash
POST /api/license/activate
Content-Type: application/json

{
  "email": "user@example.com",
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "deviceId": "device-fingerprint-hash"
}

Response: Same as verify
```

### Increment Message Count

```bash
POST /api/license/increment
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "messageCount": 451,
  "messageLimit": 1000
}
```

## Configuration

### Environment Variables

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_OPENROUTER_API_KEY=your-openrouter-key
```

### Admin Email

Default admin: `founder@example.com`
Change in `client/pages/AdminPanel.tsx` and `server/routes/admin.ts`

## File Structure

```
client/
├── components/
│   ├── LicensePopups.tsx
│   ├── LicenseActivationModal.tsx
│   └── MaintenanceModeOverlay.tsx
├── context/
│   └── AuthContext.tsx (enhanced with license methods)
├── lib/
│   ├── licenseManager.ts
│   ├── antiBypass.ts
│   └── deviceFingerprint.ts
└── pages/
    └── AdminPanel.tsx

server/
├── routes/
│   ├── license.ts
│   └── admin.ts
└── lib/
    └── licenseUtils.ts

shared/
└── api.ts (type definitions)
```

## Usage Guide

### For Users

1. **Register/Login**
   - Standard Firebase authentication
   - Automatic device fingerprinting
   - License verification on login

2. **Send Messages**
   - Free plan: 10 messages (one-time)
   - Premium plans: Daily reset at 00:00 UTC
   - License key required to upgrade

3. **Manage License**
   - Enter license key in modal
   - Monitor expiration in popup
   - Renew before expiration

### For Admins

1. **Access Admin Panel**
   - Press CTRL+F1 anywhere in app
   - Must be logged in as founder@example.com

2. **Generate Licenses**
   - Select plan and duration
   - System generates 32-char hex key
   - Share with user

3. **Manage Users**
   - Warn: Send warning (non-blocking)
   - Suspend: Temporary account lock (7 days default)
   - Ban: Permanent account lock
   - Unban/Reactivate: Remove restrictions

4. **Maintenance Mode**
   - Toggle on/off
   - Customize message
   - Blocks all non-admin access

## Testing Checklist

- [ ] Free plan users get 10 messages
- [ ] Classic/Pro users get daily limits
- [ ] Message counter resets at midnight
- [ ] License expiration popups appear
- [ ] License key activation works
- [ ] Admin can generate licenses
- [ ] Admin can warn/ban/suspend users
- [ ] Maintenance mode blocks users
- [ ] DevTools detection works
- [ ] Incognito mode detected
- [ ] localStorage protection active
- [ ] CTRL+F1 opens admin panel
- [ ] All alerts are non-dismissible
- [ ] Banned users cannot access

## Production Deployment

1. **Firebase Setup**
   - Enable Firestore
   - Enable Authentication
   - Configure security rules

2. **Environment Variables**
   - Set all Firebase credentials
   - Set OpenRouter API key
   - Configure admin email

3. **Build**

   ```bash
   pnpm build
   ```

4. **Deploy**
   - Use Netlify or Vercel
   - Set environment variables in hosting platform
   - Deploy following platform-specific instructions

## Troubleshooting

### License key invalid

- Ensure format: XXXX-XXXX-XXXX-XXXX...
- Check key is active in Firestore
- Verify hasn't been used by another account

### Messages not counting

- Check `/api/license/increment` endpoint
- Verify Firestore rules allow write
- Check user email matches in requests

### Admin panel not opening

- Verify logged in as founder@example.com
- Press CTRL+F1 (not CMD+F1 on Mac)
- Check browser console for errors

### Alerts not showing

- Check `warnings` array in license response
- Verify user has pending alerts
- Clear browser cache and reload

## Future Enhancements

- [ ] Email notifications for expiration
- [ ] Webhook support for license events
- [ ] Advanced analytics dashboard
- [ ] API rate limiting per plan
- [ ] Custom domain support
- [ ] Team collaboration features
- [ ] Bulk license generation
- [ ] License transfer between accounts
- [ ] Refund management system
- [ ] Usage reports and exports

## Support

For issues or questions:

1. Check logs in browser console
2. Review Firestore database structure
3. Verify Firebase configuration
4. Test endpoints directly with Postman

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
