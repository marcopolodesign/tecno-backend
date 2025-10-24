# 🎯 TecnoFit Sales Funnel System

## Overview

This system implements a **3-tier conversion funnel** to track customer journey from first contact to paying member:

```
PROSPECT → LEAD → USER (Customer)
```

## Content Types

### 1. 🔍 Prospect
**Initial contact - Email captured but form not submitted**

A prospect is created when:
- User starts filling out the form
- User provides their email (for retargeting)
- Form is NOT yet submitted

**Fields:**
- `email` (required, unique) - For retargeting
- `firstName` (optional)
- `lastName` (optional)
- `phone` (optional)
- `trainingGoal` (optional) - If they selected one
- `source` (default: "website")
- `capturedAt` (required) - When email was captured
- `lastInteraction` - Last time they interacted
- `convertedToLead` (boolean) - True when they submit the form
- `notes` - Admin notes
- `lead` (relation) - Links to Lead if converted

**Status:**
- Not yet a lead
- Can be used for email retargeting campaigns
- Track abandonment rate

---

### 2. 📋 Lead
**Form submitted - Qualified contact**

A lead is created when:
- Prospect completes and submits the full contact form
- All required fields are provided
- Ready for sales team follow-up

**Fields:**
- `firstName` (required)
- `lastName` (required)
- `email` (required, unique)
- `phone` (required)
- `trainingGoal` (required) - Their fitness objective
- `status` - Lead status:
  - `nuevo` (new) - Just submitted
  - `contactado` (contacted) - Sales team reached out
  - `en-negociacion` (negotiating) - In discussions
  - `convertido` (converted) - Became a customer
  - `perdido` (lost) - Did not convert
- `submittedAt` (required) - When form was submitted
- `lastContactedAt` - Last contact attempt
- `convertedToUser` (boolean) - True when they become a customer
- `notes` - Admin notes
- `prospect` (relation) - Links back to original Prospect
- `user` (relation) - Links to User if converted

**Workflow:**
1. Sales team sees new lead
2. Contacts them within 24 hours
3. Updates status as they progress
4. Converts to User when they sign up

---

### 3. ✅ User (Customer)
**Converted lead - Paying member**

A user is created when:
- Lead signs membership contract
- Becomes a paying customer
- Starts training at TecnoFit

**Fields:**
- `firstName` (required)
- `lastName` (required)
- `email` (required, unique)
- `phone` (required)
- `trainingGoal` (required)
- `membershipType` (required):
  - `mensual` (monthly)
  - `trimestral` (quarterly)
  - `semestral` (semi-annual)
  - `anual` (annual)
- `membershipStatus`:
  - `activo` (active) - Currently training
  - `pausado` (paused) - Temporarily suspended
  - `cancelado` (cancelled) - Membership ended
  - `vencido` (expired) - Needs renewal
- `startDate` (required) - Membership start
- `endDate` - Membership expiration
- `emergencyContact` - Emergency contact name
- `emergencyPhone` - Emergency contact phone
- `medicalNotes` - Health conditions, injuries, etc.
- `convertedAt` (required) - When they became a customer
- `notes` - Admin notes
- `lead` (relation) - Links back to original Lead

**Membership Management:**
- Track active memberships
- Set renewal reminders
- Manage cancellations
- Store medical information

---

## Conversion Funnel Flow

### Step 1: Capture Prospect
```javascript
// User starts form, provides email
POST /api/prospects
{
  "data": {
    "email": "maria@gmail.com",
    "capturedAt": "2025-10-21T10:00:00Z"
  }
}
```

### Step 2: Convert to Lead
```javascript
// User submits complete form
POST /api/leads
{
  "data": {
    "firstName": "María",
    "lastName": "González",
    "email": "maria@gmail.com",
    "phone": "+54 11 1234-5678",
    "trainingGoal": "perdida-peso",
    "submittedAt": "2025-10-21T10:15:00Z",
    "prospect": 1  // Link to existing prospect
  }
}

// Update prospect
PUT /api/prospects/1
{
  "data": {
    "convertedToLead": true
  }
}
```

### Step 3: Convert to User
```javascript
// Lead signs up for membership
POST /api/users
{
  "data": {
    "firstName": "María",
    "lastName": "González",
    "email": "maria@gmail.com",
    "phone": "+54 11 1234-5678",
    "trainingGoal": "perdida-peso",
    "membershipType": "mensual",
    "membershipStatus": "activo",
    "startDate": "2025-10-25",
    "convertedAt": "2025-10-21T15:00:00Z",
    "lead": 1  // Link to lead
  }
}

// Update lead
PUT /api/leads/1
{
  "data": {
    "status": "convertido",
    "convertedToUser": true
  }
}
```

---

## Analytics & Metrics

### Conversion Rates

**Prospect → Lead Conversion:**
```
(Total Leads / Total Prospects) × 100
```

**Lead → User Conversion:**
```
(Total Users / Total Leads) × 100
```

**Overall Conversion (Prospect → User):**
```
(Total Users / Total Prospects) × 100
```

### Time Metrics

- **Time to Lead:** Average time from prospect capture to form submission
- **Time to Contact:** Average time from lead submission to first contact
- **Time to Convert:** Average time from lead to user conversion
- **Lead Response Time:** Track how quickly team contacts new leads

### Funnel Health

- **Abandonment Rate:** Prospects who don't convert to leads
- **Lost Lead Rate:** Leads marked as "perdido"
- **Active Membership Rate:** Users with "activo" status
- **Renewal Rate:** Users who renew memberships

---

## Admin Panel Views

### Prospects Dashboard
- Total prospects captured
- Conversion rate to leads
- Abandoned prospects (for retargeting)
- Recent prospects

### Leads Dashboard
- Total leads by status
- New leads (last 24h)
- Contacted vs. not contacted
- Conversion rate to users
- Lead source breakdown

### Users Dashboard
- Total active members
- Memberships by type
- Expiring memberships (next 30 days)
- Revenue by membership type
- Retention rate

---

## Sample Data Structure

### Prospect Example
```json
{
  "id": 1,
  "email": "maria.gonzalez@gmail.com",
  "firstName": null,
  "capturedAt": "2025-10-21T10:00:00Z",
  "convertedToLead": false,
  "source": "website"
}
```

### Lead Example
```json
{
  "id": 1,
  "firstName": "María",
  "lastName": "González",
  "email": "maria.gonzalez@gmail.com",
  "phone": "+54 11 4567-8901",
  "trainingGoal": "perdida-peso",
  "status": "contactado",
  "submittedAt": "2025-10-21T10:15:00Z",
  "convertedToUser": false,
  "prospect": { "id": 1 }
}
```

### User Example
```json
{
  "id": 1,
  "firstName": "María",
  "lastName": "González",
  "email": "maria.gonzalez@gmail.com",
  "phone": "+54 11 4567-8901",
  "trainingGoal": "perdida-peso",
  "membershipType": "mensual",
  "membershipStatus": "activo",
  "startDate": "2025-10-25",
  "convertedAt": "2025-10-21T15:00:00Z",
  "lead": { "id": 1 }
}
```

---

## Best Practices

### For Prospects
✅ Capture email as early as possible
✅ Track partial form completions
✅ Set up automated email retargeting
✅ Monitor abandonment patterns

### For Leads
✅ Contact within 24 hours
✅ Update status consistently
✅ Add notes after each interaction
✅ Set follow-up reminders

### For Users
✅ Keep membership status updated
✅ Track payment dates
✅ Set renewal reminders
✅ Store medical info securely
✅ Monitor attendance

---

## Next Steps

1. ✅ Restart Strapi to load new content types
2. ✅ Set permissions in Strapi admin
3. ✅ Update frontend form to create Prospects first
4. ✅ Update admin panel to show all three levels
5. ✅ Create conversion workflows
6. ✅ Set up analytics dashboard

---

© 2025 TecnoFit - Sales Funnel System

