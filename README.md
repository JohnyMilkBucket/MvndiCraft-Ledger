# MvndiCraft Trade Ledger

Official trade ledger for the MvndiCraft Minecraft server.
Supports Nations, Organizations, real-time sync, and a global anonymous market graph.

---

## 📋 WHAT YOU NEED BEFORE STARTING

- [Node.js](https://nodejs.org/) v18 or later
- A [Google account](https://accounts.google.com/) (for Firebase)
- [Git](https://git-scm.com/) installed
- A GitHub account with access to: https://github.com/JohnyMilkBucket/MvndiCraft-Ledger

---

## PART 1 — FIREBASE SETUP

### Step 1.1 — Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Name it: `mvndicraft-ledger` (or anything you like)
4. Disable Google Analytics (not needed)
5. Click **"Create project"**

### Step 1.2 — Enable Google Authentication

1. In your project, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Under **"Sign-in providers"**, click **"Google"**
4. Toggle **"Enable"**
5. Enter your support email
6. Click **"Save"**

### Step 1.3 — Add Authorized Domains (Required for the app)

1. Still in **Authentication → Settings → Authorized domains**
2. Add these domains:
   - `localhost`
   - `127.0.0.1`
   - (If hosting on Firebase Hosting, your `*.web.app` domain will be added automatically)

### Step 1.4 — Create Firestore Database

1. Click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"** (rules are already written)
4. Select your region (e.g. `us-central`)
5. Click **"Enable"**

### Step 1.5 — Deploy Firestore Security Rules

1. In Firestore, click **"Rules"** tab
2. Delete everything in the editor
3. Open the file `firestore.rules` from this project
4. Copy everything from it and paste into the Firebase rules editor
5. Click **"Publish"**

### Step 1.6 — Get Your Firebase Config

1. In your project, click the ⚙ gear icon → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click **"Add app"** → choose the **Web** icon (`</>`)
4. Nickname it `MvndiCraft Ledger Web`
5. **Do NOT** check "Also set up Firebase Hosting" for now
6. Click **"Register app"**
7. You will see a `firebaseConfig` object like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "mvndicraft-ledger.firebaseapp.com",
  projectId: "mvndicraft-ledger",
  storageBucket: "mvndicraft-ledger.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 1.7 — Add Config to the App

1. Open `src/index.html`
2. Find this section near the top of the `<script>` block:

```javascript
const FIREBASE_CONFIG = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  ...
};
```

3. Replace each `REPLACE_WITH_...` value with the values from your Firebase config

---

## PART 2 — GITHUB SETUP

### Step 2.1 — Initialize the Repository

Open a terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit: MvndiCraft Trade Ledger v1.0"
```

### Step 2.2 — Connect to GitHub

```bash
git remote add origin https://github.com/JohnyMilkBucket/MvndiCraft-Ledger.git
git branch -M main
git push -u origin main
```

### Step 2.3 — Future Updates

Whenever you make changes:

```bash
git add .
git commit -m "Describe your changes here"
git push
```

### Step 2.4 — Create a Release (for the .exe download)

After building the .exe (see Part 4):

1. Go to: https://github.com/JohnyMilkBucket/MvndiCraft-Ledger/releases
2. Click **"Draft a new release"**
3. Tag version: `v1.0.0`
4. Title: `MvndiCraft Trade Ledger v1.0.0`
5. Upload the `.exe` file from `dist/`
6. Click **"Publish release"**

---

## PART 3 — RUNNING THE WEB VERSION

The `src/index.html` file can be opened directly in any browser, or hosted anywhere.

To host it for free on Firebase:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Set "src" as your public directory
# Say NO to single-page app rewrite
firebase deploy
```

---

## PART 4 — BUILDING THE DESKTOP APP (.exe)

### Step 4.1 — Install Dependencies

```bash
npm install
```

### Step 4.2 — Run the App in Development

```bash
npm start
```

### Step 4.3 — Build the Windows .exe Installer

```bash
npm run build:win
```

The installer will appear in the `dist/` folder as:
`MvndiCraft Trade Ledger Setup 1.0.0.exe`

### Step 4.4 — Build for All Platforms

```bash
npm run build:all
```

---

## PART 5 — APP ICON (Optional but recommended)

Place these files in the `assets/` folder:

| File | Size | Platform |
|---|---|---|
| `icon.ico` | 256×256 (multi-size ICO) | Windows |
| `icon.icns` | macOS .icns bundle | Mac |
| `icon.png` | 512×512 PNG | Linux |

You can convert a PNG to ICO using: https://convertio.co/png-ico/

---

## PART 6 — ROLE SYSTEM

| Role | Permissions |
|---|---|
| **Viewer** | Read-only access to the ledger and statistics |
| **Merchant** | Can record new trades |
| **Leader** | Full control: trades, delete records, manage join code |
| **Moderator** | See ALL org ledgers in the Admin Console. Assign new moderators. |

**Notes:**
- When a user joins via code, they start as **Viewer**
- The Nation/Organization **Leader** assigns roles within their group
- Only `OPHacker303@gmail.com` has Moderator access and can appoint new Moderators
- The Admin Console tab is **completely invisible** to all non-moderators

**To promote a member's role (as Leader):**
You must do this directly in the Firebase Firestore console:
1. Go to **Firestore → users → (find the user's document)**
2. Edit the `role` field to: `viewer`, `merchant`, or `leader`

*(A role management UI for leaders is planned for a future update)*

---

## PART 7 — GLOBAL MARKET GRAPH

The **Statistics** tab shows two sections:

1. **🌐 Global Market — All Realms**: Real-time anonymous graph showing the top 25 most-traded items across ALL nations and organizations. No nation/org names are shown — only item names and total trade values.

2. **Your Org's Statistics**: Your local ledger analysis with all charts, visible only to your org.

The global graph auto-updates in real-time using Firebase's `onSnapshot` listener. Enemy nations cannot tell *who* is trading what — only *what* is being traded globally.

---

## PART 8 — FIRESTORE DATA STRUCTURE

```
/users/{uid}
  - email, displayName, photoURL
  - role: 'viewer' | 'merchant' | 'leader' | 'moderator'
  - orgId: string | null
  - orgType: 'nation' | 'organization' | null

/orgs/{orgId}
  - name, type, leaderId, joinCode, memberCount, createdAt

/orgs/{orgId}/trades/{tradeId}
  - nation, item, type, qty, price, date, notes
  - createdBy, createdAt, orgId

/globalStats/{itemSlug}
  - item (display name), totalQty, tradeCount, totalValue
  (anonymous — no org info ever stored here)
```

---

## TROUBLESHOOTING

**"Firebase: Error (auth/unauthorized-domain)"**
→ Add `localhost` and `127.0.0.1` to Firebase Auth > Authorized Domains

**"Missing or insufficient permissions"**
→ Re-publish the Firestore rules from `firestore.rules`

**"Cannot find module 'electron'"**
→ Run `npm install` first

**App won't build on Windows**
→ Make sure you have `icon.ico` in the `assets/` folder (electron-builder requires it)

**Global graph not showing**
→ Trades must be recorded first to populate globalStats. The graph appears once data exists.
