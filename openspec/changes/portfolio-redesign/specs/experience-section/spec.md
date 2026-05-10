## ADDED Requirements

### Requirement: Experience section lists past roles

The system SHALL render a "Where I've worked" section displaying a vertically stacked timeline of past roles, each row showing date range, role title, company, and a short note.

#### Scenario: Visitor scrolls to Experience

- **WHEN** the Experience section enters the viewport
- **THEN** the section header reads "Where I've worked"
- **AND** each role from mock data renders as a row with date range on the left, role + company in the middle, and any note on the right

### Requirement: Date ranges format as "MMM YYYY — MMM YYYY"

The system SHALL format each role's start and end into short month-and-year form, using "Present" when the role is ongoing.

#### Scenario: Role is ongoing

- **WHEN** a role entry has `end: "present"`
- **THEN** the rendered date range ends with "Present"

#### Scenario: Role has a closed end date

- **WHEN** a role entry has an ISO `yyyy-mm` end date
- **THEN** the rendered date range shows the formatted month and year

### Requirement: Experience list reads from mock data

The system SHALL source role entries from the mock-data module in the order declared (newest first).

#### Scenario: Mock data declares three roles

- **WHEN** the Experience section renders
- **THEN** the three roles render in the order declared in mock data
