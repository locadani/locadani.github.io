---
title: MailSense
context: work
org: Backwell Tech Corp
start: 2025-12
summary: An email automation platform where an AI agent reads incoming mail and drafts replies, with per-tenant feature flags controlling which capabilities each customer has.
tech: [csharp, dotnet, aspnet-core, postgresql, docker, minio, microsoft-graph, gmail-api, python]
images:
  - src: ./mailsense-architecture.svg
    alt: Diagram of the MailSense email pipeline, showing the email processor reading and sending mail via Outlook, Gmail, or generic IMAP/SMTP, storing data in per-tenant storage, and pushing each tenant's context to a single shared AI agent that classifies email and drafts replies using that pushed context instead of its own database.
  - src: ./mailsense-workflow-list.png
    alt: The MailSense workflow list, showing several orders at different stages of the Request, Quote, Order, Production, and Ready pipeline, filterable by status.
  - src: ./mailsense-ai-conversation.png
    alt: An operator-in-the-loop conversation where the AI agent asks a clarifying question about a missing price before it can proceed with an order.
---

A master database routes each request to the correct tenant database, with per-tenant mail
connections and object storage buckets. Mail is ingested by a dedicated processor over different sources (IMAP/SMTP, Microsoft Graph API or Gmail API).

The platform runs as several services — an API, an email processor, the Python AI agent,
and shared libraries. Local development runs the whole stack, mail server included, in Docker.
