---
title: Customer Intelligence
context: work
org: Backwell Tech Corp
start: 2026-05
summary: A multi-tenant SaaS platform for businesses, running printed-letter campaigns to existing customers and new prospects, with churn and lifetime-value predictions to prioritise who to contact.
tech: [nextjs, react, typescript, supabase, postgresql, tailwind, stripe, openai, figma, tanstack-query, vitest]
images:
  - src: ./customer-intelligence-architecture.svg
    alt: Diagram of Customer Intelligence's per-tenant pipeline, from CSV import through geocoding, churn/CLV scoring, and personalization, handing off to a separate, standalone letter service that submits PDFs to Pingen and reports delivery status back over a webhook.
  - src: ./customer-intelligence-map.png
    alt: The customer map, showing prospects and customers clustered geographically
  - src: ./customer-intelligence-dashboard.png
    alt: A campaign dashboard showing total sales, conversion rate, views, a contacted-shops list, top products, and top buyers.
---

Customers are imported from CSV, geocoded, and segmented on a map. Each recipient gets a
personalised landing page and intro letter, dispatched through a letter microservice.
Churn and lifetime-value predictions surface per customer, and letters and emails draw
from a Stripe-backed credit ledger.

Tenancy is enforced in the database with row-level security. Shipped in four languages.
