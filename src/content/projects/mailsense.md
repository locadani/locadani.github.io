---
title: MailSense
context: work
org: Backwell Tech Corp
start: 2025-12
summary: An email automation platform that I migrated from single-tenant to multi-tenant, so one deployment can serve many customers in isolation.
tech: [csharp, dotnet, aspnet-core, postgresql, docker, minio, microsoft-graph, python]
images:
  - src: ./mailsense-architecture.svg
    alt: Diagram of the MailSense email pipeline, showing the email processor reading and sending mail via Outlook, Gmail, or generic IMAP/SMTP, storing data in per-tenant storage, and pushing each tenant's context to a single shared AI agent that classifies email and drafts replies using that pushed context instead of its own database.
  - src: ./mailsense-workflow-list.png
    alt: The MailSense workflow list, showing three orders moving through Request, Quote, Order, Production, and Ready stages, with one flagged as needing input.
  - src: ./mailsense-ai-conversation.png
    alt: An operator-in-the-loop conversation where the AI agent asks a clarifying question about a missing price before it can proceed with an order.
---

A master database routes each request to the correct tenant database, with per-tenant mail
connections and object storage buckets. Mail is ingested by a dedicated processor over
IMAP and SMTP, or through the Microsoft Graph API where a tenant uses Outlook; stored
credentials are encrypted.

The platform runs as several services — an API, an email processor, a sense processor and
shared libraries — with a legacy MVC dashboard being progressively retired. Local
development runs the whole stack, mail server included, in Docker.
