# TCM Clinic App - Complete Testing Guide
## Dr Roni Sapir Wellness Platform

---

## 🏠 SECTION A: PUBLIC PAGES (No Login Required)

### A1. Homepage (`/`)
- [ ] Background image loads correctly
- [ ] "Dr Roni Sapir" name displays with audio icon
- [ ] Click audio icon → Bio audio plays
- [ ] Audio player controls work (play/pause, progress, volume)
- [ ] "Watch Short Video" button → Opens video modal
- [ ] Video modal: Play/pause, navigation arrows, close button
- [ ] "CM Digital Encyclopedia" button → Navigates to encyclopedia
- [ ] "Install App" button → Shows PWA install prompt
- [ ] Language switcher (English/Hebrew) works
- [ ] WhatsApp button → Opens WhatsApp chat
- [ ] "Therapist Login" button → Navigates to auth page
- [ ] Home icon (top left) → Stays on homepage

### A2. Encyclopedia Landing (`/encyclopedia`)
- [ ] Page loads with proper hero background
- [ ] All feature cards display correctly
- [ ] "TCM Brain" card → Navigates to TCM Brain
- [ ] "Symptom Checker" card → Navigates to symptom checker
- [ ] "Treatment Planner" card → Navigates to treatment planner
- [ ] "BaZi Calculator" card → Navigates to BaZi page
- [ ] Back button works
- [ ] Language toggle works

### A3. Contact Page (`/contact`)
- [ ] Contact form displays
- [ ] Form validation works (required fields)
- [ ] Submit button sends email
- [ ] Success/error toast messages appear
- [ ] WhatsApp link works

### A4. Install App Page (`/install`)
- [ ] iOS instructions display
- [ ] Android instructions display
- [ ] PWA install banner works (if supported)

### A5. Therapist Registration (`/therapist/register`)
- [ ] Registration form displays
- [ ] Israeli ID validation works
- [ ] Form submission works
- [ ] Success message appears

---

## 🔐 SECTION B: AUTHENTICATION

### B1. Auth Page (`/auth`)
- [ ] Login tab displays email/password fields
- [ ] Sign up tab displays registration fields
- [ ] Password field has show/hide toggle
- [ ] Login with valid credentials → Success
- [ ] Login with invalid credentials → Error message
- [ ] Sign up creates new account
- [ ] Redirect to Gate page after auth

### B2. Gate Page (`/gate`)
- [ ] Access code input displays
- [ ] Valid access code → Grants tier access
- [ ] Invalid code → Error message
- [ ] Tier badge updates after successful code entry

---

## 🧠 SECTION C: TCM BRAIN & AI FEATURES (Requires Login)

### C1. TCM Brain (`/tcm-brain`)
- [ ] Chat interface loads
- [ ] Can type and send messages
- [ ] AI responds with TCM knowledge
- [ ] Voice input button works
- [ ] Session history accessible
- [ ] Templates dropdown works
- [ ] Feedback (thumbs up/down) works
- [ ] Mobile voice notes drawer works (mobile)

### C2. Symptom Checker (`/symptom-checker`)
- [ ] Symptom input form displays
- [ ] Can select multiple symptoms
- [ ] "Analyze" button triggers AI analysis
- [ ] Results display with TCM patterns
- [ ] Recommendations show correctly

### C3. Treatment Planner (`/treatment-planner`)
- [ ] Patient info form displays
- [ ] Condition selection works
- [ ] "Generate Plan" creates treatment plan
- [ ] Plan shows acupuncture points
- [ ] Plan shows herbal recommendations
- [ ] PDF export works

### C4. BaZi Calculator (`/bazi`)
- [ ] Date/time picker works
- [ ] Calculate button generates chart
- [ ] BaZi wheel displays
- [ ] Element analysis shows
- [ ] Chinese zodiac displays

### C5. CM Brain Questions (`/cm-brain-questions`)
- [ ] Question list displays
- [ ] Can select questions
- [ ] Submit sends to AI
- [ ] Responses display correctly

---

## 📋 SECTION D: CRM SYSTEM (Requires Login + Tier Access)

### D1. CRM Dashboard (`/crm`)
- [ ] Dashboard loads with statistics
- [ ] Total patients count correct
- [ ] Today's appointments list correct
- [ ] Upcoming appointments count correct
- [ ] Weekly visits count correct
- [ ] Quick action buttons work
- [ ] Session timer widget displays

### D2. Patients List (`/crm/patients`)
- [ ] Patient list loads
- [ ] Search by name works
- [ ] Search by phone works
- [ ] Search by ID number works
- [ ] "Add Patient" button works
- [ ] Patient row click → Opens detail page
- [ ] WhatsApp button on each row works

### D3. Add New Patient (`/crm/patients/new`)
- [ ] Full intake form displays
- [ ] Personal info section works
- [ ] Medical history section works
- [ ] TCM assessment section works
- [ ] Lifestyle section works
- [ ] Pregnancy section (conditional) works
- [ ] Israeli ID validation works
- [ ] Save button creates patient
- [ ] Cancel button returns to list

### D4. Patient Detail (`/crm/patients/:id`)
- [ ] Patient info displays correctly
- [ ] Edit button → Opens edit form
- [ ] Visit history tab shows visits
- [ ] Add Visit button works
- [ ] Documents tab works
- [ ] Consent form section works
- [ ] WhatsApp button works
- [ ] Delete patient works (with confirmation)

### D5. Patient Edit (`/crm/patients/:id/edit`)
- [ ] Pre-fills existing patient data
- [ ] All fields editable
- [ ] Save updates patient
- [ ] Cancel returns to detail

### D6. Calendar (`/crm/calendar`)
- [ ] Calendar view loads
- [ ] Month/week/day views work
- [ ] Appointments display on correct dates
- [ ] Click date → Opens appointment dialog
- [ ] Can create new appointment
- [ ] Can edit existing appointment
- [ ] Can delete appointment
- [ ] Room selection works
- [ ] Patient selection works
- [ ] Recurring appointments work
- [ ] Color coding by status works

### D7. Rooms Management (`/crm/rooms`)
- [ ] Room list displays
- [ ] "Add Room" button works
- [ ] Room name, description, capacity fields
- [ ] **Special Instructions field works**
- [ ] Color picker works
- [ ] Active/inactive toggle works
- [ ] Edit room works
- [ ] Delete room works (with confirmation)
- [ ] Room linked to clinic correctly

### D8. Staff Management (`/crm/staff`)
- [ ] Staff list displays
- [ ] "Add Staff" button works
- [ ] Role selection (owner/admin/therapist/receptionist)
- [ ] Staff linked to clinic correctly
- [ ] Active/inactive toggle works
- [ ] Edit staff works
- [ ] Remove staff works

### D9. Clinics Management (`/crm/clinics`)
- [ ] Clinic list displays
- [ ] "Add Clinic" button works
- [ ] Clinic name, address, phone, email fields
- [ ] **Booking contact name field works**
- [ ] **Booking contact phone field works**
- [ ] **General instructions field works**
- [ ] Timezone selection works
- [ ] Edit clinic works
- [ ] Delete clinic works (with confirmation)

### D10. Patient Consent Form (`/crm/patients/:id/consent`)
- [ ] Consent form displays
- [ ] Questions render correctly
- [ ] Signature pad works
- [ ] Submit saves consent
- [ ] PDF generation works

---

## 🎥 SECTION E: VIDEO SESSION

### E1. Video Session (`/video-session`)
- [ ] Session panel loads
- [ ] Patient selector works
- [ ] Start session button works
- [ ] Timer starts counting
- [ ] Quick patient dialog works
- [ ] Anxiety Q&A dialog works
- [ ] Voice dictation works
- [ ] Session notes editable
- [ ] Generate report button works
- [ ] End session saves data
- [ ] Zoom invite dialog works
- [ ] Calendar invite dialog works

---

## ⚙️ SECTION F: ADMIN FEATURES (Admin Role Required)

### F1. Admin Dashboard (`/admin`)
- [ ] Admin panel loads
- [ ] User management section
- [ ] Password management section
- [ ] Knowledge registry link works

### F2. Admin Feedback (`/admin/feedback`)
- [ ] Page feedback list displays
- [ ] Chat feedback list displays
- [ ] Can delete feedback

### F3. Admin Disclaimers (`/admin/disclaimers`)
- [ ] Therapist disclaimers list displays
- [ ] Can view disclaimer details
- [ ] Expiration dates show correctly

### F4. Knowledge Registry (`/knowledge-registry`)
- [ ] Document list displays
- [ ] Upload new document works
- [ ] Import to RAG works
- [ ] Delete document works
- [ ] Status updates correctly

---

## 📱 SECTION G: MOBILE & PWA

### G1. Mobile Responsiveness
- [ ] Homepage responsive on mobile
- [ ] Navigation works on mobile
- [ ] CRM sidebar collapses on mobile
- [ ] Forms usable on mobile
- [ ] Calendar usable on mobile

### G2. PWA Features
- [ ] App installable on iOS
- [ ] App installable on Android
- [ ] Offline indicator works
- [ ] App icon displays correctly

---

## 🌐 SECTION H: INTEGRATIONS

### H1. WhatsApp Integration
- [ ] Floating WhatsApp button works
- [ ] Appointment reminder WhatsApp works
- [ ] Contact WhatsApp link works

### H2. AI Features
- [ ] TCM Brain AI responses work
- [ ] Symptom analysis works
- [ ] Treatment planning works
- [ ] Session report generation works
- [ ] Voice-to-text works
- [ ] Text-to-speech works

---

## 🔧 SECTION I: EDGE CASES & ERROR HANDLING

### I1. Error Handling
- [ ] Invalid routes show 404 page
- [ ] API errors show toast messages
- [ ] Network errors handled gracefully
- [ ] Form validation errors display

### I2. Session Management
- [ ] Session persists on refresh
- [ ] Logout clears session
- [ ] Tier access enforced correctly

---

## ✅ TESTING STATUS

| Section | Status | Notes |
|---------|--------|-------|
| A - Public Pages | ⬜ | |
| B - Authentication | ⬜ | |
| C - TCM Brain | ⬜ | |
| D - CRM System | ⬜ | |
| E - Video Session | ⬜ | |
| F - Admin Features | ⬜ | |
| G - Mobile & PWA | ⬜ | |
| H - Integrations | ⬜ | |
| I - Error Handling | ⬜ | |

---

**Legend:**
- ⬜ Not Started
- 🟡 In Progress
- ✅ Completed
- ❌ Issues Found

---

*Last Updated: December 29, 2024*
*Version: 1.0*
