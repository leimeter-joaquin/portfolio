## ADDED Requirements

### Requirement: App renders from the content package

The app SHALL consume `@portfolio/content/data` as the source for hero copy, projects, experience, and site contact/CV. The `app/src/data/mock.ts` module SHALL be removed. No section component SHALL hardcode hero copy, project data, experience, or contact strings.

#### Scenario: Home page renders

- **WHEN** the home page builds
- **THEN** Hero, Projects, and Experience render data originating from `content/dist/index.json`
- **AND** no values come from `mock.ts` (the file no longer exists)

### Requirement: Content projects map to the project card view model

The app SHALL map content projects (which lack presentation fields) to the `ProjectCard` model: deriving `summary` from the first highlight, `href` from `links.live` then `links.repo` (omitted when both are null), tag chips from `stack`, a `gradient` assigned from a palette, and `featured` from the current role (no end date) or most recent start date.

#### Scenario: Project has no live or repo link

- **WHEN** a content project has `links.live` and `links.repo` both null
- **THEN** its card renders without a dead link target

#### Scenario: Featured project selection

- **WHEN** the projects list is mapped
- **THEN** exactly one project is marked featured (the current role, else the most recent by `dateStart`)
