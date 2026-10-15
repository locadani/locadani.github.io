---
title: Smoke tracker
context: personal
start: 2026-10
repo: https://github.com/locadani/smoke-tracker
summary: An installable web app for logging cigarette smoke drifting into our apartment from neighbours, in about five seconds from a phone. Months of reports build a detailed, tamper-evident record that could support a formal complaint.
tech: [rust, axum, htmx, postgresql, sqlite, docker, google-cloud, terraform, github-actions]
imageCaptions: false
images:
  - src: ./smoke-tracker-log.png
    alt: The Log screen on a phone, with a smell event in progress banner and this month's counts of events, reports, bedroom days and clean checks.
  - src: ./smoke-tracker-log-level.png
    alt: Logging a report, with the bedroom ticked and level 7 picked, and the level's meaning shown underneath, "Very strong. Can't stay comfortably; smell builds up."
  - src: ./smoke-tracker-graphs.png
    alt: The graphs screen for the last 30 days, plotting nightly smell intensity against PM2.5 readings that rise and fall together.
  - src: ./smoke-tracker-event.png
    alt: One evening's event, with a timeline of two smell reports, rooms and symptoms, and a PM2.5 reading.
---

Each report records the rooms checked with a 0–10 smell level, symptoms, and an optional
PM2.5 reading; reports group into events that can be closed, or auto-close overnight.
Residents can invite guests through a QR code with expiring accounts, and every change is
written to a hash-chained audit log that a CLI command verifies.

A layered Cargo workspace with SQLite and Postgres backends behind one shared contract test
suite. Server-rendered with Askama and htmx, available in three languages, and deployed as a
single static binary to Cloud Run on every push, with the infrastructure in Terraform.

Live at [locadani.github.io/smoke-tracker](/smoke-tracker).
