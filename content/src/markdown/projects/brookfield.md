---
type: project
title: Brookfield Residential
slug: brookfield-residential
dateStart: 2020-02
dateEnd: 2021-09
stack:
  - Vue 2
  - Vue 3
  - TypeScript
  - Tailwind CSS
  - Vuex
  - Pinia
  - Mapbox GL
  - Jenkins
tags:
  - front-end
  - enterprise
  - real-estate
links:
  repo: null
  live: https://www.brookfieldresidential.com/
highlights:
  - Co-led the Vue 2 → Vue 3 and Vuex → Pinia migrations across a multi-package monorepo.
  - Built a URL-driven filter system with interdependent filters synced to a Mapbox GL map view.
  - Worked on a front-end team of 6 (4 devs, 2 QA), in close coordination with a separate back-end team.
  - Maintained a Jenkins CI/CD pipeline across a codebase split into one package per page.
---

My first project after a six-month full stack bootcamp. I joined a front-end team of six — four developers and two QA — working on the Brookfield Residential public site, separate from but closely coordinated with a back-end team.

The work spanned two major transitions: migrating from Vue 2 to Vue 3, and moving state management from Vuex to Pinia. I owned a substantial portion of both.

I also built the property listings filtering system. Filters hydrated from the URL on page load, updated the URL as users interacted, and stayed in sync with a Mapbox GL map view. Because many filters depended on each other, managing state order and view consistency was a significant part of the design. The URL-as-state approach meant filter configurations could be shared directly between users.
