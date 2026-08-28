## ADDED Requirements

### Requirement: Site config is the source for contact and CV

The system SHALL provide a `site` content document holding `contact` (location, email, github URL, linkedin URL) and `cv` (path, label). The build SHALL validate it and emit it under `site` in `index.json`. The app SHALL source all contact links and the CV download from this document, with no contact strings hardcoded in components.

#### Scenario: Site document is built

- **WHEN** `npm run build:content` runs
- **THEN** `dist/index.json` includes a `site` object with `contact.{location,email,github,linkedin}` and `cv.{path,label}`

#### Scenario: Contact link is changed

- **WHEN** a developer edits `linkedin` in `site.md`
- **THEN** the header, footer, and hero aside reflect the new link on next build with no component edits
