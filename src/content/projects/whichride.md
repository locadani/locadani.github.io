---
title: whichride
context: personal
start: 2026-10
repo: https://github.com/locadani/whichride
summary: Shows which carsharing car in Berlin is cheapest for one trip, among the cars actually parked nearby. An Android app takes a shared Google Maps link and works out the distance and time; a web page takes kilometres and minutes.
tech: [rust, kotlin, android, axum, astro, svelte, webassembly, typescript, postgresql, docker, google-cloud, terraform, github-actions]
imageCaptions: false
images:
  - src: ./whichride-trip.png
    alt: The website on a phone, with a trip of 7.4 km and 22 minutes typed in and a card asking which cars are near you.
  - src: ./whichride-cars.png
    alt: The car sheet listing every MILES, Bolt Drive and SIXT share car with its price for the trip, three of them ticked.
  - src: ./whichride-result.png
    alt: The result, with Bolt Drive's VW Polo the cheapest of the ticked cars at €5.64, and a note that one car not added would be cheaper.
---

One Rust core holds every pricing rule: per-minute and per-kilometre rates, packages,
minimum fares, personal discounts and subscriptions. The Android app (Jetpack Compose)
calls it through UniFFI and the website through WebAssembly, so both always rank the cars
the same way.

Prices are kept current by the people using it: a reported price applies to its reporter
at once and becomes everyone's after enough confirmations, with no moderation step. No
route or location is ever stored; coordinates only pass through an OpenRouteService proxy
in request bodies.

One design-token file generates both the Compose theme and the site's CSS, with colour
contrast checked in CI. In English, Italian, German and Turkish; deployed to Cloud Run on
every push, with the infrastructure in Terraform.

Live at [locadani.github.io/whichride](/whichride).
