---
title: Customer Intelligence
context: work
org: Backwell Tech Corp
start: 2026-05
summary: A multi-tenant SaaS platform for businesses running printed-letter campaigns to existing customers and new prospects, with churn and lifetime-value predictions to prioritise who to contact.
tech: [nextjs, react, typescript, supabase, postgresql, tailwind, stripe, openai, leaflet, tanstack-query, vitest]
images:
  - src: ./customer-intelligence-architecture.svg
    alt: Diagram of Customer Intelligence's per-tenant pipeline, from CSV import through geocoding, churn/LTV scoring, and personalization, handing off to a separate, standalone letter service that submits PDFs to Pingen and reports delivery status back over a webhook.
  - src: ./customer-intelligence-map.png
    alt: The customer map, showing prospects and customers across Italy and Europe clustered geographically and colored by predicted lifetime value.
---

Customers are imported from CSV, geocoded, and segmented on a map. Each recipient gets a
personalised landing page and intro letter, dispatched through a letter microservice.
Churn and lifetime-value predictions surface per customer, and letters and emails draw
from a Stripe-backed credit ledger.

Tenancy is enforced in the database with row-level security, and behaviour is configured
per tenant through feature flags rather than code changes. Shipped in four languages.
