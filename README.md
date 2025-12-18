# Play, Learn & Protect

A web-based educational platform with digital safety features for children (ages 3-12) in Egypt, featuring Parent, Teacher, and Admin dashboards.

## 🎯 Current Status: STEP 2 - Dashboards + Consent UX + Event Logging Complete

✅ **STEP 1 Features:**
- Secure authentication system (JWT-based)
- Role-based access control (RBAC) for Admin, Parent, Teacher, and Child roles
- PostgreSQL for structured data (users, profiles, classrooms, consents)
- MongoDB for events and incident logging
- Parent-Teacher consent workflow
- Dashboard shells for all user roles

✅ **STEP 2 Features (NEW):**
- 🎮 **Child Launcher UI** - Kid-friendly interface with big buttons and minimal text
- 📊 **Activity Event Logging** - All child actions logged to MongoDB
- ✨ **Enhanced Consent Flow** - Real-time feedback with success/error messages
- 🚀 **Launch Button** - Parents can launch child mode directly from dashboard
- 💾 **Activity Tracking Service** - Backend service for logging and querying events
- 🎯 **Activity Stats** - Endpoint to get aggregated activity statistics

## 🏗️ Architecture Overview

### Tech Stack
- **Backend:** NestJS (TypeScript)
- **Frontend:** Next.js 16 (App Router, TypeScript)
- **Databases:**
  - PostgreSQL - structured data (users, profiles, relationships)
  - MongoDB - events, logs, incidents
- **Authentication:** JWT with Bearer tokens
- **Infrastructure:** Docker Compose (local development)

### Project Structure

```
RE/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication & JWT
│   │   ├── entities/       # PostgreSQL entities
│   │   ├── schemas/        # MongoDB schemas
│   │   ├── parent/         # Parent module
│   │   ├── teacher/        # Teacher module
│   │   ├── consent/        # Consent workflow
│   │   └── database/
│   │       └── seeds/      # Demo data seed script
│   ├── .env               # Backend configuration
│   └── package.json
├── frontend/               # Next.js frontend
│   ├── app/
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   ├── parent/        # Parent dashboard
│   │   ├── teacher/       # Teacher dashboard
│   │   ├── admin/         # Admin dashboard
│   │   └── child/         # Child profile pages
│   ├── contexts/          # React contexts (auth)
│   ├── lib/               # Utilities (API client)
│   ├── components/        # Reusable components
│   ├── .env.local        # Frontend configuration
│   └── package.json
├── docker-compose.yml     # Docker services
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for local databases)
- Git

### Step 1: Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Start Databases with Docker

**Note:** Docker must be installed. If Docker is not available, you can use remote PostgreSQL and MongoDB services and update the connection strings accordingly.

```bash
# Start PostgreSQL and MongoDB
docker compose up -d

# Verify containers are running
docker compose ps
```

### Step 3: Configure Environment Variables

Backend environment variables are already set in `backend/.env`. Frontend configuration is in `frontend/.env.local`.

**Backend (`backend/.env`):**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=plp_user
DATABASE_PASSWORD=plp_password
DATABASE_NAME=play_learn_protect

MONGODB_URI=mongodb://plp_user:plp_password@localhost:27017/play_learn_protect?authSource=admin

JWT_SECRET=plp-secret-key-2024-change-me-in-production
JWT_EXPIRES_IN=7d

NODE_ENV=development
PORT=3001

FRONTEND_URL=http://localhost:3000
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 4: Seed Database with Demo Data

```bash
cd backend
npm run seed
```

**Demo Accounts Created:**
- **Admin:** `admin@playlearn.eg` / `password123`
- **Parent:** `parent@example.eg` / `password123`
- **Teacher:** `teacher@school.eg` / `password123`

The seed script also creates:
- 1 child profile (Layla Ahmed, age 7)
- 1 classroom (Grade 2 - A)
- 1 pending consent request (Teacher → Parent)

### Step 5: Start the Applications

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

Backend will start on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will start on `http://localhost:3000`

## 🧪 Testing Step 1 Acceptance Criteria

### Test 1: Parent Creates Child Account

1. Open http://localhost:3000
2. Login as parent: `parent@example.eg` / `password123`
3. Click "Add Child" button
4. Enter child details:
   - Name: "Omar Mohamed"
   - Age: 8
5. Click "Save"
6. ✅ Child should appear in the parent's children list

### Test 2: Teacher Requests Consent

1. Logout and login as teacher: `teacher@school.eg` / `password123`
2. Note: A classroom "Grade 2 - A" already exists from seed data
3. To request consent, you need:
   - Parent Profile ID (from parent dashboard or database)
   - Child ID (from parent dashboard or database)
   - Classroom ID (visible in teacher's classroom list)
4. Click "New Request" and fill in the form
5. ✅ Request should be sent successfully

### Test 3: Parent Approves Consent

1. Logout and login as parent: `parent@example.eg` / `password123`
2. You should see "Pending Consent Requests" section
3. Click "Approve" on any pending request
4. ✅ Request should move from pending to approved
5. ✅ Child should be enrolled in the classroom

### Test 4: Admin Access

1. Logout and login as admin: `admin@playlearn.eg` / `password123`
2. ✅ Admin dashboard should load
3. Note: Full admin features coming in STEP 5

### Test 5: Role-Based Access Control

1. Try accessing different role dashboards:
   - `/parent` - Only accessible by parents
   - `/teacher` - Only accessible by teachers
   - `/admin` - Only accessible by admins
2. ✅ Unauthorized users should be redirected to their appropriate dashboard

## 📊 Database Schema

### PostgreSQL Tables

| Entity | Description |
|--------|-------------|
| `users` | Base user accounts with email, password, role |
| `parent_profiles` | Parent-specific information |
| `teacher_profiles` | Teacher-specific information |
| `child_profiles` | Child accounts (managed by parents) |
| `classrooms` | Teacher-managed classrooms |
| `classroom_students` | Junction table (child ↔ classroom) |
| `consents` | Parent-teacher consent requests |

### MongoDB Collections

| Collection | Description |
|-----------|-------------|
| `activityevents` | Child activity logging (for STEP 2) |
| `threatincidents` | Safety incident records (for STEP 5) |
| `sandboxcreations` | Child-created content (for STEP 3) |

## 🔐 Role & Permission Matrix

| Feature | Admin | Parent | Teacher | Child |
|---------|-------|--------|---------|-------|
| Register/Login | ❌ (pre-created) | ✅ | ✅ | ❌ |
| Manage Children | ❌ | ✅ (own) | ❌ | ❌ |
| Create Classrooms | ❌ | ❌ | ✅ | ❌ |
| Request Consent | ❌ | ❌ | ✅ | ❌ |
| Approve/Reject Consent | ❌ | ✅ | ❌ | ❌ |
| View Child Progress | ❌ | ✅ (own) | ✅ (with consent) | ❌ |
| Access Child UI | ❌ | ❌ | ❌ | ✅ (via parent) |

## 🛣️ API Endpoints (Steps 1 & 2)

### Authentication
```
POST   /api/auth/register     - Register new parent/teacher
POST   /api/auth/login        - Login
POST   /api/auth/logout       - Logout
GET    /api/auth/me           - Get current user
```

### Parent Endpoints
```
POST   /api/parent/children           - Create child account
GET    /api/parent/children           - List own children
GET    /api/parent/children/:id       - Get child details
GET    /api/parent/consents/pending   - List pending consent requests
GET    /api/parent/consents           - List all consents
```

### Activity Endpoints (NEW in STEP 2)
```
POST   /api/activity/log                     - Log child activity event
GET    /api/activity/child/:childId          - Get child's activity history
GET    /api/activity/child/:childId/stats    - Get aggregated activity stats
GET    /api/activity/child/:childId/type/:eventType  - Filter activities by type
```

### Teacher Endpoints
```
POST   /api/teacher/classrooms        - Create classroom
GET    /api/teacher/classrooms        - List own classrooms
GET    /api/teacher/classrooms/:id    - Get classroom details
GET    /api/teacher/consents          - List all consent requests
```

### Consent Endpoints
```
POST   /api/consents/teacher-request  - Teacher requests consent
PATCH  /api/consents/:id/approve      - Parent approves consent
PATCH  /api/consents/:id/reject       - Parent rejects consent
GET    /api/consents/:id              - Get consent details
```

## 🔄 Consent Workflow

1. **Teacher** creates a classroom
2. **Teacher** requests consent to add a specific child to their classroom
   - Requires: `parentId`, `childId`, `classroomId`
   - Status: `PENDING`
3. **Parent** receives consent request notification
4. **Parent** reviews and either approves or rejects
   - If **approved**: Child is automatically enrolled in classroom
   - If **rejected**: Request is declined
5. **Teacher** can view consent status

## 📝 Important Notes

### Children Cannot Login
- Children do NOT have direct login credentials
- Parents access child profiles through their dashboard
- Child UI (coming in STEP 2) will be a simplified, parent-supervised interface

### Development vs Production
- `synchronize: true` is enabled for TypeORM (auto-creates tables)
- In production, use proper migrations
- Change `JWT_SECRET` before production deployment
- Use stronger passwords

### What's NOT in Step 1
- ❌ Games and play features (STEP 3)
- ❌ Learning progress tracking (STEP 3)
- ❌ Leaderboards and rewards (STEP 3)
- ❌ PDF reports (STEP 3)
- ❌ Screen-time limits (STEP 5)
- ❌ Threat detection (STEP 5)
- ❌ Admin moderation features (STEP 5)

## 🐛 Troubleshooting

### Docker containers won't start
```bash
# Check if ports 5432 and 27017 are available
# Stop existing services if needed
docker compose down
docker compose up -d
```

### Backend won't connect to databases
- Ensure Docker containers are running: `docker compose ps`
- Check `.env` file has correct credentials
- Verify no other services are using ports 5432 (PostgreSQL) or 27017 (MongoDB)

### Frontend shows "Network Error"
- Ensure backend is running on http://localhost:3001
- Check `frontend/.env.local` has correct API URL
- Verify CORS is enabled in backend

### "Cannot find module" errors
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

## 🎯 STEP 2 - Testing & Verification

### ✅ Test 1: Child Launcher UI
1. Login as parent: `parent@example.eg` / `password123`
2. Click **"🚀 Launch"** button on any child card
3. **Expected:** Colorful child-friendly interface loads with big activity buttons
4. Click any activity button (Play, Learn, Art, etc.)
5. **Expected:** Activity click is logged to MongoDB
6. Click "Back to Parent"
7. **Expected:** Returns to parent dashboard

### ✅ Test 2: Activity Logging
1. While in child launcher, click 3-4 different activity buttons
2. Check MongoDB to verify events:
```bash
# Connect to MongoDB (if using Docker)
docker exec -it play-learn-protect-mongo mongosh -u plp_user -p plp_password

# In mongo shell
use play_learn_protect
db.activityevents.find().pretty()
```
3. **Expected:** See `launcher_open`, `activity_click` events in MongoDB

### ✅ Test 3: Enhanced Consent UX
1. Login as parent: `parent@example.eg` / `password123`
2. If you have pending consents, click **"✓ Approve"**
3. **Expected:** Green success message appears: "✅ Consent approved! [Teacher Name] can now access..."
4. Message auto-disappears after 5 seconds
5. Consent moves from pending list

### ✅ Test 4: Activity Stats API
Test the new activity endpoints:
```bash
# Get activity stats (replace {childId} with actual ID)
curl http://localhost:3001/api/activity/child/{childId}/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get activity history
curl http://localhost:3001/api/activity/child/{childId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Next Steps (STEP 3)

The next phase will implement:
- 🎮 **Actual Games** - Playable PLAY and LEARN games
- 🏆 **Rewards System** - Points, badges, leaderboards
- 📊 **Progress Tracking** - Charts and analytics
- 📄 **PDF Reports** - Export child progress
- 🎯 **Adaptive Difficulty** - Games adjust to child's skill level

## 📞 Support

For issues or questions about this implementation, refer to the project requirements document or contact the development team.

---

## 📝 STEP 2 - What Changed

**New Backend Files:**
- [backend/src/activity/](backend/src/activity/) - Activity logging service and endpoints
  - `activity.service.ts` - MongoDB event logging
  - `activity.controller.ts` - Activity REST API
  - `activity.module.ts` - Activity module
  - `dto/create-activity-event.dto.ts` - Activity event DTO

**Updated Backend Files:**
- [backend/src/app.module.ts](backend/src/app.module.ts) - Added ActivityModule

**New Frontend Files:**
- [frontend/app/child-launcher/[childId]/page.tsx](frontend/app/child-launcher/[childId]/page.tsx) - Child launcher UI

**Updated Frontend Files:**
- [frontend/app/parent/page.tsx](frontend/app/parent/page.tsx) - Added Launch button, success/error messages

---

**Version:** STEP 2 Complete (Dashboards + Consent UX + Event Logging)
**Last Updated:** December 2024
