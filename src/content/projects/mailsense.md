---
title: MailSense
context: work
org: Backwell Tech Corp
start: 2025-12
summary: An email automation platform that I migrated from single-tenant to multi-tenant, so one deployment can serve many customers in isolation.
tech: [csharp, dotnet, aspnet-core, postgresql, docker, minio, microsoft-graph, python]
---

A master database routes each request to the correct tenant database, with per-tenant mail
connections and object storage buckets. Mail is ingested by a dedicated processor over
IMAP and SMTP, or through the Microsoft Graph API where a tenant uses Outlook; stored
credentials are encrypted.

The platform runs as several services — an API, an email processor, a sense processor and
shared libraries — with a legacy MVC dashboard being progressively retired. Local
development runs the whole stack, mail server included, in Docker.
