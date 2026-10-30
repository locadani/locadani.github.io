---
title: whichride
context: personal
start: 2026-10
repo: https://github.com/locadani/whichride
summary: Shows which carsharing car in Berlin is cheapest for one trip, among the cars actually parked nearby. The Android app takes a shared Google Maps link and works out the distance and time; on the web page users enter the kilometres and minutes by hand.
tech: [rust, kotlin, android, axum, astro, svelte, webassembly, typescript, postgresql, docker, google-cloud, terraform, github-actions]
imageCaptions: false
images:
  - src: ./whichride-architecture.svg
    alt: Diagram of the whichride architecture, showing the same Rust core built into the Android app through UniFFI, into the website through WebAssembly, and into the server on Google Cloud Run, which answers the app, serves the website, stores the catalogue and crowd prices in Postgres, and passes coordinates through to OpenRouteService without storing them.
  - src: ./whichride-pipeline.svg
    alt: Diagram of the whichride delivery pipeline, showing every pull request passing Rust, app, design, security and infrastructure checks before it can merge, each merge to main deploying one scanned Docker image with the server and website to Google Cloud Run without a stored key, with Terraform owning every other setting and applied by hand after review.
  - src: ./whichride-trip.png
    alt: The website on a phone, with a trip of 7.4 km and 22 minutes typed in and a card asking which cars are near you.
  - src: ./whichride-cars.png
    alt: The car sheet listing every MILES, Bolt Drive and SIXT share car with its price for the trip, three of them ticked.
  - src: ./whichride-result.png
    alt: The result, with Bolt Drive's VW Polo the cheapest of the ticked cars at €5.64, and a note that one car not added would be cheaper.
---

One Rust core holds every pricing rule: per-minute and per-kilometre rates, packages,
minimum fares, personal discounts and subscriptions. The Android app (Jetpack Compose)
calls it through UniFFI and the website through WebAssembly.

Prices are kept updated by the users: a reported price applies to its reporter and becomes
effective for everybody after enough confirmations.

The destination is converted to coordinates by OpenRouteService.
One design-token file generates both the Compose theme and the site's CSS. In English, Italian, German and Turkish; deployed to Cloud Run on
every push, with the infrastructure in Terraform.

Live at [locadani.github.io/whichride](/whichride).
