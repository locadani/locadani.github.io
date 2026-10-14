---
title: Smoke tracker
context: personal
start: 2026-10
repo: https://github.com/locadani/smoke-tracker
summary: An installable web app for logging cigarette smoke drifting into our apartment from neighbours, in about five seconds from a phone. Months of reports build a detailed, tamper-evident record that could support a formal complaint.
tech: [rust, axum, htmx, postgresql, sqlite, docker, google-cloud, terraform, github-actions]
---

Each report records the rooms checked with a 0–10 smell level, symptoms, and an optional
PM2.5 reading; reports group into events that can be closed, or auto-close overnight.
Residents can invite guests through a QR code with expiring accounts, and every change is
written to a hash-chained audit log that a CLI command verifies.

A layered Cargo workspace with SQLite and Postgres backends behind one shared contract test
suite. Server-rendered with Askama and htmx, available in three languages, and deployed as a
single static binary to Cloud Run on every push, with the infrastructure in Terraform.

Live at [locadani.github.io/smoke-tracker](/smoke-tracker).
