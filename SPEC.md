# ROSTER — Functional Specification v1

## Problem Statement

Blue Orange Digital does staff augmentation alongside consulting. When presenting candidates to clients, there's no standardized, professional way to share resumes. The current process is manual — reformatting resumes, emailing PDFs, collecting feedback over email/Slack. This is slow, looks unprofessional, and makes it hard to track client decisions.

Roster solves this by giving Blue Orange a polished, branded portal to present standardized candidate profiles to clients, collect structured feedback, and track the review process.

## Users

### 1. Admin (Blue Orange team)
- Logs in with email/password
- Manages candidates, companies, and assignments
- Full access to all data

### 2. Client Reviewer
- Added by email by a Blue Orange admin
- Authenticates via magic link (emailed) or password
- Can only see candidates assigned to their company
- Can review, give feedback, request interviews
- Multiple reviewers per company

## User Stories — Admin Side

### US-1: Team Tailor Sync
As an admin, I want to connect to our Team Tailor account and pull in candidates so I don't have to manually re-enter data.

Acceptance Criteria:
- Given valid Team Tailor API credentials, when I initiate a sync, then I see a list of candidates from Team Tailor
- Given the candidate list, when I select candidates to import, then their profile data (name, experience, skills, education, resume) is pulled into Roster
- Given an imported candidate, their data is copied into Roster as a one-time import (not live-synced)
- Given a previously imported candidate, when I click "Resync," then their Roster profile updates with the latest Team Tailor data
- Given the Candidates page, when I click "Sync from Team Tailor," then I see any new candidates added since the last sync

### US-2: Candidate Profile Management
As an admin, I want to edit a candidate's profile so I can present a clean, standardized version to clients.

Acceptance Criteria:
- Given an imported candidate, when I open their profile, then I see an editable form with all their information
- Given the edit form, when I modify any field (summary, experience, skills, education), then changes are saved to Roster (not back to Team Tailor)
- Given the profile, the client-facing view shows first name only — no last name is displayed
- Given experience entries, past company names and full experience details ARE visible to clients (not anonymized)
- Given any field, when I edit it, then the changes appear in the client-facing view

### US-3: Write Candidate Summary
As an admin, I want to write a custom summary for each candidate so clients get a quick, compelling overview.

Acceptance Criteria:
- Given a candidate profile, when I write a summary, then it appears prominently at the top of the client-facing profile
- Given the summary field, when I edit and save, then it updates immediately

### US-4: Standardized Resume Format
As an admin, I want all candidate profiles presented in a consistent, professional format so every candidate looks polished regardless of their original resume quality.

Acceptance Criteria:
- Given any candidate, when a client views their profile, then it displays in a standardized layout (consistent sections, typography, spacing)
- Given the standardized view, then it shows: first name, summary, skills, experience (with company names), education, certifications
- Given the standardized view, then it looks professional and matches Blue Orange Digital branding
- Given the design, it follows the Blue Orange design system (see blueorange-design skill): navy/orange color palette, clean typography, spacious layout, modern feel matching AIRQ and Blueprint pages

### US-5: Company Management
As an admin, I want to create client companies and assign candidates to them so I can organize presentations.

Acceptance Criteria:
- Given the admin dashboard, when I create a company, then I provide: company name, point of contact, and any notes
- Given a company, when I assign candidates, then those candidates appear in that company's review portal
- Given a candidate, when I assign them to multiple companies, then each company sees only their assigned candidates

### US-6: Generate Client Access Link
As an admin, I want to generate a shareable link for a company so their team can review candidates.

Acceptance Criteria:
- Given a company, when I generate a link, then I get a unique URL I can share
- Given the link, when a client clicks it, then they are prompted to authenticate (magic link or password)
- Given the link, when I want to revoke access, then I can deactivate or regenerate the link

### US-7: Add Client Reviewers
As an admin, I want to add multiple reviewers from the client company by email so the hiring team can all review independently.

Acceptance Criteria:
- Given a company, when I add a reviewer by email, then that person can authenticate and access the company's portal
- Given multiple reviewers, when they each submit feedback, then I see individual feedback per reviewer
- Given the admin view, then I can see who has reviewed and who hasn't

### US-8: Track Review Status
As an admin, I want to see the status of every candidate across all companies so I know where things stand.

Acceptance Criteria:
- Given the admin dashboard, when I look at a company, then I see each candidate's status: Not Reviewed / Reviewed / Interview Requested / Not Interested
- Given a candidate, when a client leaves feedback, then I see their comments and the reviewer's name
- Given the dashboard, then I can filter/sort by status across all companies

## User Stories — Client Reviewer Side

### US-9: Access Review Portal
As a client reviewer, I want to receive a link and log in easily so there's minimal friction.

Acceptance Criteria:
- Given a company link, when I click it, then I'm prompted to authenticate (magic link sent to my email, or password if set)
- Given successful auth, then I land on a page showing all assigned candidates
- Given the portal, then I see candidate cards with: first name, summary snippet, key skills
- Given an invalid or revoked link, then I see a clear error message

### US-10: Review Candidate Profile
As a client reviewer, I want to view a candidate's full standardized profile so I can evaluate them.

Acceptance Criteria:
- Given the candidate list, when I click a candidate card, then I see their full standardized profile
- Given the profile, then I see: first name (no last name), summary, skills, full experience with company names, education
- Given the profile, no last name or personal contact info is visible

### US-11: Submit Feedback
As a client reviewer, I want to indicate my interest level and leave comments so the agency knows my preferences.

Acceptance Criteria:
- Given a candidate profile, when I review them, then I can choose: Interested / Request Interview / Not Interested
- Given "Not Interested," when I submit, then I'm prompted to provide a reason (optional but encouraged)
- Given "Request Interview," when I submit, then the admin is notified (visible on their dashboard)
- Given any decision, when I submit, then I can still change my mind and update later

### US-12: Review Multiple Candidates
As a client reviewer, I want to move through candidates efficiently so I don't waste time.

Acceptance Criteria:
- Given the candidate list, when I've reviewed a candidate, then their card shows my status (reviewed/interested/not interested)
- Given the list, then I can see at a glance which candidates I still need to review
- Given the list, then I can sort or filter by: all, not reviewed, interested, not interested

## User Flows

### Admin Flow — Setting Up a Presentation

1. Admin logs into Roster
2. Admin goes to Settings → Team Tailor and enters API credentials (one-time setup)
3. Admin clicks "Sync Candidates" → sees a list of candidates from Team Tailor
4. Admin selects candidates to import → they appear in the Candidates section
5. For each candidate, admin opens the profile:
   - Reviews imported data
   - Writes a custom summary
   - Edits experience entries if needed
   - Previews the client-facing version (first name only, standardized layout)
6. Admin goes to Companies → creates a new company (e.g., "Acme Corp")
7. Admin assigns 3-5 selected candidates to Acme Corp
8. Admin adds reviewer emails (e.g., hiring-manager@acme.com, vp-eng@acme.com)
9. Admin generates a share link for Acme Corp
10. Admin copies the link and sends it to the client via email (outside Roster)

### Client Flow — Reviewing Candidates

1. Client reviewer receives an email with the Roster link from Blue Orange
2. Clicks the link → lands on auth screen
3. Enters their email → receives a magic link (or enters password)
4. Lands on the company portal showing 3-5 candidate cards in a clean grid
5. Each card shows: first name, summary snippet (2-3 lines), top skills
6. Reviewer clicks a candidate → sees the full standardized profile
7. Reads summary, scrolls through experience (with company names), skills, education
8. Clicks "Interested" / "Request Interview" / "Not Interested"
9. If "Not Interested" → optional feedback text box appears
10. Returns to the list → that candidate card now shows their decision
11. Works through remaining candidates
12. Admin sees all feedback in real-time on their dashboard

### Admin Flow — Resyncing Candidates

1. New candidates have been added in Team Tailor
2. Admin clicks "Sync from Team Tailor" → sees new candidates alongside already-imported ones
3. Admin selects new candidates to import
4. For a previously imported candidate, admin can click "Resync" to pull latest data
5. Resync overwrites Team Tailor fields but preserves any custom summary or edits marked as manual

## Constraints & Boundaries

### In Scope
- Admin auth (email/password login)
- Team Tailor API integration (one-time candidate import with resync option)
- Candidate profile management (edit all fields)
- First-name-only display for client view (only anonymization)
- Standardized, Blue Orange branded resume formatting
- Company management and candidate assignment
- Client reviewer management (add by email)
- Client auth (magic link or password)
- Shareable link generation per company
- Client review portal (feedback, interest level, comments)
- Multiple reviewers per company
- Status tracking dashboard for admins
- Blue Orange Digital branded design (matching AIRQ/Blueprint style)

### Out of Scope (v1)
- Calendar integration for interview scheduling (v1 = "Request Interview" status, BOD handles manually)
- Video/file upload beyond what comes from Team Tailor
- Chat/messaging between client and BOD within the portal
- Email notifications from Roster (v1 = admin checks dashboard)
- Billing or invoicing
- White-labeling / custom branding per client
- Mobile native app (responsive web is sufficient)
- Candidate comparison view (side-by-side)
- Bulk operations on candidates

### Performance
- Page loads under 2 seconds
- Team Tailor sync handles up to 500 candidates
- Support up to 50 concurrent client reviewers

### Security
- Admin accounts require email/password auth
- Client reviewers authenticate via magic link or password
- Company links are unique, unguessable, and revocable
- No candidate last name or personal contact info visible to clients
- All data encrypted in transit

### Integration
- Team Tailor API (candidate data import, resync)
- No other integrations in v1

### Design
- Blue Orange Digital branded (navy/orange palette, modern, professional)
- Match the design language of blueorange.digital, AIRQ landing page, and Blueprint app
- Use the blueorange-design skill reference for brand guidelines
- Clean, spacious layouts with professional typography
- 3-5 candidates per typical presentation

## Definition of Done

1. Admin can log in with email and password
2. Admin can connect Team Tailor via API credentials and sync candidates
3. Admin can import selected candidates from Team Tailor into Roster (one-time copy)
4. Admin can resync a previously imported candidate to pull latest Team Tailor data
5. Admin can see new candidates added to Team Tailor since last sync
6. Admin can edit any candidate field (name, summary, experience, skills, education)
7. Client-facing view displays first name only (no last name) — all other data including company names is visible
8. Admin can preview the client-facing version of any candidate profile
9. All candidate profiles display in a standardized, professional, Blue Orange branded format
10. Admin can create companies with name and contact info
11. Admin can assign candidates to one or more companies
12. Admin can add client reviewers by email to a company
13. Admin can generate a unique, shareable link per company
14. Admin can revoke or regenerate a company's link
15. Client reviewers authenticate via magic link or password
16. Client reviewers see only candidates assigned to their company
17. Client reviewers can view full standardized candidate profiles (first name only)
18. Client reviewers can mark candidates as Interested / Request Interview / Not Interested
19. Client reviewers can leave written feedback on any candidate
20. Client reviewers can update their decisions after submitting
21. Admin dashboard shows review status per candidate per company
22. Admin can see individual reviewer feedback and which reviewers haven't responded
23. Admin can filter/sort candidates by review status
24. UI is responsive and works on desktop and tablet
25. All pages load in under 2 seconds
26. Design matches Blue Orange brand (navy/orange, modern, matching AIRQ/Blueprint style)

## Human Checkpoints

1. **After auth + Team Tailor sync** — Verify admin login works, Team Tailor data pulls correctly, candidate import and resync work cleanly
2. **After candidate management + standardized view** — Verify editing, first-name-only display, and the branded client-facing profile look great and match Blue Orange design
3. **After client portal + feedback** — Verify the full client experience: link access, magic link auth, review flow, feedback submission, admin dashboard
