# Alternate Build — `dev/build` branch

This file is intentionally additive: it does not modify `README.md`, `docs/PROGRESS.md`,
or `docs/REQUIREMENTS.md` on `master`, since those actively document the implementation
that lives on this branch. It exists to point at a second, independently-built
implementation of Dayflow that was developed in parallel on the **`dev/build`** branch of
this same repository, in case it's useful as a reference or for comparison before the
final submission is chosen.

## What's on `dev/build`

A separate full-stack implementation, built and verified independently of the code on
`master`:

- **Backend**: Node.js + Express + TypeScript + Prisma (SQLite), JWT + bcrypt auth,
  role-based authorization enforced on every route, attendance/leave/payroll/notifications/
  analytics APIs. Every endpoint was smoke-tested live over HTTP during development
  (not just unit-tested).
- **Frontend**: React + TypeScript + Vite + Tailwind CSS v4, fully wired to the real
  backend from the start (no mock-data layer to swap out). Covers auth, both dashboards,
  profile management, attendance, leave workflow, payroll, in-app notifications, and an
  analytics page with "Smart HR Insights" (attendance anomaly detection, leave-frequency
  outliers, department staffing).
- Verified via strict TypeScript compilation and a production `vite build`, both clean.

## Why it's a separate branch, not merged here

`master`'s `client/` and `server/` directories use a different architecture (Zustand +
mock-data service layer on the frontend, a different backend folder layout) and are under
active integration per `TEAM_TASKS.md`. A blind merge of `dev/build` into `master` would
conflict across nearly every file and risk overwriting that in-progress work, so it was
deliberately kept isolated.

## To look at it

```bash
git checkout dev/build
cd server && npm install && npx prisma migrate dev && npm run seed && npm run dev
cd ../client && npm install && npm run dev
```

Demo accounts (password `Password123` for all): `hr@dayflow.com`,
`john@dayflow.com`, `priya@dayflow.com`, `amit@dayflow.com`, `sara@dayflow.com`,
`rahul@dayflow.com`. Full setup notes and requirement traceability for this branch live in
its own `README.md` and `docs/` — they only apply on `dev/build`, not here.
