# Metaswarm Task Prompt — Roster

```
/start-task Read SPEC.md for the complete functional specification. Build Roster — a candidate presentation portal for Blue Orange Digital's staff augmentation business.

Roster lets Blue Orange admins import candidates from Team Tailor, create standardized branded profiles (first name only, no last name), assign them to client companies, and generate shareable links for client reviewers to evaluate candidates and provide feedback.

IMPORTANT DESIGN REQUIREMENTS:
- Use the blueorange-design skill reference (in the skills repo) for brand guidelines
- Use the frontend-design plugin for all UI work
- Design must match Blue Orange Digital's brand: navy/orange palette, modern professional look
- Reference screenshots in blueorange-design/references/ for the exact style (homepage, AIRQ landing page, Blueprint app)
- This is an enterprise-grade portal — it needs to impress clients

Two user types:
1. Admin (Blue Orange team) — email/password auth, manages everything
2. Client Reviewer — added by email, magic link or password auth, reviews candidates only

Key integration: Team Tailor API for candidate import (one-time copy with resync option)

Definition of Done:
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

Human checkpoints:
1. After auth + Team Tailor sync — verify admin login, Team Tailor data pull, candidate import and resync
2. After candidate management + standardized view — verify editing, first-name-only display, branded client-facing profile
3. After client portal + feedback — verify link access, magic link auth, review flow, feedback, admin dashboard

Use the full metaswarm orchestration workflow: research, create an implementation plan, run the design review gate, decompose into work units, and execute each through the 4-phase loop (implement, validate, adversarial review, commit).

For ALL frontend/UI work, use the frontend-design skill AND the blueorange-design skill reference to ensure production-grade design that matches Blue Orange Digital branding.

Push all code to origin. Do NOT create a PR — just push to main.

When checkpoint 1 is reached, STOP and run: openclaw system event --text "Roster Checkpoint 1: Auth + Team Tailor sync ready for review" --mode now
```
