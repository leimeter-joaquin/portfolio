---
name: "Pinia"
proficiencyBadge: "Proficient"
description: "Vue's official state management library, which I've used in production and migrated large Vuex stores into."
---

# Why Pinia

Pinia replaced Vuex as Vue's recommended state management solution, and the difference is significant. It's simpler, fully typed out of the box, and works naturally with the Composition API. Stores feel like composables rather than a separate abstraction layer, which makes them easier to test and easier to split.

I've worked with Pinia both from scratch and through migration — taking large Vuex stores and restructuring them into Pinia. The migration work at Brookfield Residential was a meaningful exercise in understanding how state was being used, what was actually shared vs unnecessarily global, and how to reorganise it without breaking things.

## What I Focus On

- Store design: keeping stores focused and avoiding the monolithic store anti-pattern
- Migrating Vuex modules to Pinia stores without disrupting the running application
- Getters, actions, and using `storeToRefs` to keep reactivity intact in components
- Composing stores — using one store inside another cleanly
- TypeScript integration: Pinia's type inference is one of its biggest practical advantages

## Real-World Usage

I've used Pinia at Brookfield Residential (migration from Vuex) and at AlixPartners (greenfield). The Brookfield migration was the more demanding context — a large existing codebase with complex interdependencies and a live product that couldn't break.
