# Requirements Document

## Introduction

FactSaura is a misinformation immunity platform designed for crisis scenarios such as floods, riots, and other emergency situations. The system treats misinformation like a biological virus, using phylogenetic algorithms to trace the origin of rumors, map how narratives mutate as they spread across social media, and visualize this evolution through an interactive evolutionary tree. The platform enables community-driven content submission, AI-powered analysis, and real-time tracking of misinformation propagation patterns.

## Glossary

- **System**: The FactSaura platform (frontend, backend, database, and AI services)
- **User**: Any person interacting with the FactSaura platform
- **Incident**: A major crisis event being monitored for misinformation (e.g., "Mumbai Flood 2025")
- **Post**: A single social media content item (Tweet, WhatsApp message, etc.)
- **Patient Zero**: The original source post of a misinformation thread
- **Mutation Score**: A numerical value (0-100) representing the degree of text similarity between a parent post and child post
- **Mutation Type**: Classification of how content changed (Emotional, Factual, Fabrication)
- **Phylogenetic Tree**: A visual graph representation showing the evolution and spread of misinformation
- **Agent**: A user who submits suspicious content for analysis
- **Truth Scorecard**: A report showing the analysis results of submitted content

## Requirements

### Requirement 1

**User Story:** As a crisis monitor, I want to view all active misinformation incidents in a dashboard, so that I can quickly assess current threats.

#### Acceptance Criteria

- [x] 1. WHEN the System loads the home view, THE System SHALL retrieve all active Incidents from the database
- [x] 2. WHEN displaying Incidents, THE System SHALL render each Incident as a card with title, severity, location, and status
- [x] 3. WHEN an Incident has high viral velocity, THE System SHALL display a red glowing border on the Incident card
- [x] 4. WHEN an Incident has contained viral velocity, THE System SHALL display a green glowing border on the Incident card
- [x] 5. WHEN displaying an Incident card, THE System SHALL show live statistics including infected node count and mutation rate

### Requirement 2

**User Story:** As a researcher, I want to visualize how misinformation evolves from its source, so that I can understand the mutation patterns.

#### Acceptance Criteria

1. WHEN a User selects an Incident, THE System SHALL display a phylogenetic tree visualization showing all related Posts
2. WHEN rendering the phylogenetic tree, THE System SHALL position the Patient Zero Post as the root node
3. WHEN a Post has a parent Post, THE System SHALL draw a connecting edge between the child Post and parent Post
4. WHEN calculating edge color, THE System SHALL use green for Mutation Scores less than ten percent
5. WHEN calculating edge color, THE System SHALL use yellow for Mutation Scores between ten percent and forty percent
6. WHEN calculating edge color, THE System SHALL use red for Mutation Scores greater than forty percent
7. WHEN a User clicks a Post node, THE System SHALL display a side panel showing the Post content and parent Post content with highlighted differences

### Requirement 3

**User Story:** As an agent, I want to submit suspicious content for analysis, so that I can contribute to identifying misinformation.

#### Acceptance Criteria

1. WHEN a User submits text content, THE System SHALL compare the submitted text against all existing Posts in the database using fuzzy matching
2. WHEN the submitted text matches an existing Post with similarity greater than eighty percent, THE System SHALL link the submitted content to the existing phylogenetic tree
3. WHEN the submitted text does not match any existing Post, THE System SHALL invoke the AI service to analyze the risk level
4. WHEN analysis completes, THE System SHALL return a Truth Scorecard showing the match percentage and related known misinformation
5. WHEN processing a submission, THE System SHALL display a scanning animation to the User

### Requirement 4

**User Story:** As a system administrator, I want to store Incidents and Posts in a relational database, so that the data persists and can be queried efficiently.

#### Acceptance Criteria

- [x] 1. WHEN creating an Incident record, THE System SHALL store the title, severity, location, and status fields
- [x] 2. WHEN creating a Post record, THE System SHALL store the content, author, timestamp, and Incident identifier fields
- [x] 3. WHEN a Post is derived from another Post, THE System SHALL store the parent Post identifier in the child Post record
- [x] 4. WHEN calculating a Mutation Score, THE System SHALL store the score value as a float between zero and one hundred
- [x] 5. WHEN classifying mutation, THE System SHALL store the Mutation Type as one of Emotional, Factual, or Fabrication

### Requirement 5

**User Story:** As a developer, I want the System to calculate text similarity between Posts, so that mutation patterns can be identified automatically.

#### Acceptance Criteria

1. WHEN comparing two Post contents, THE System SHALL calculate the Levenshtein distance between the text strings
2. WHEN the Levenshtein distance is calculated, THE System SHALL convert the distance to a Mutation Score percentage
3. WHEN a Post is linked to a parent Post, THE System SHALL compute and store the Mutation Score immediately
4. WHEN the Mutation Score is less than ten percent, THE System SHALL classify the relationship as a retweet
5. WHEN the Mutation Score is between ten percent and forty percent, THE System SHALL classify the relationship as spin or exaggeration
6. WHEN the Mutation Score is greater than forty percent, THE System SHALL classify the relationship as fabrication or panic

### Requirement 6

**User Story:** As a demo presenter, I want the System to operate with pre-seeded simulation data, so that the demonstration is reliable without depending on live external APIs.

#### Acceptance Criteria

1. WHEN the System initializes in simulation mode, THE System SHALL load pre-seeded Incident and Post data from the database
2. WHEN pre-seeding data, THE System SHALL create a complete phylogenetic tree with ten to fifteen linked Posts
3. WHEN pre-seeding data, THE System SHALL ensure Posts have varying Mutation Scores to demonstrate all edge color classifications
4. WHEN operating in simulation mode, THE System SHALL function without requiring external API connectivity
5. WHEN AI features are unavailable, THE System SHALL continue to display existing data and perform local text similarity calculations

### Requirement 7

**User Story:** As a user, I want the interface to provide visual feedback during operations, so that I understand the System is processing my requests.

#### Acceptance Criteria

1. WHEN a User submits content for analysis, THE System SHALL display an animated scanning indicator
2. WHEN the phylogenetic tree is loading, THE System SHALL display a loading state
- [x] 3. WHEN hovering over an Incident card, THE System SHALL provide visual feedback indicating interactivity
4. WHEN transitioning between views, THE System SHALL use smooth animations
5. WHEN displaying the phylogenetic tree, THE System SHALL use glassmorphism styling with transparency effects

### Requirement 8

**User Story:** As an API consumer, I want the backend to expose RESTful endpoints, so that the frontend can retrieve and submit data.

#### Acceptance Criteria

- [x] 1. WHEN the backend starts, THE System SHALL expose an endpoint to retrieve all active Incidents
- [x] 2. WHEN the backend receives a request for a specific Incident, THE System SHALL return the Incident details and all related Posts
3. WHEN the backend receives a content submission, THE System SHALL process the text and return analysis results
- [x] 4. WHEN the backend processes requests, THE System SHALL handle operations asynchronously
5. WHEN the backend exposes endpoints, THE System SHALL generate automatic API documentation

### Requirement 9

**User Story:** As a data analyst, I want Posts to maintain parent-child relationships, so that the misinformation propagation chain can be reconstructed.

#### Acceptance Criteria

- [x] 1. WHEN a Post is created with a parent Post identifier, THE System SHALL establish a relationship between the child Post and parent Post
2. WHEN querying a Post, THE System SHALL allow retrieval of the parent Post
3. WHEN querying a Post, THE System SHALL allow retrieval of all child Posts
4. WHEN constructing a phylogenetic tree, THE System SHALL traverse the parent-child relationships to build the complete graph
5. WHEN a Post has no parent Post identifier, THE System SHALL identify the Post as a Patient Zero candidate

### Requirement 10

**User Story:** As a content moderator, I want to track Incident severity levels, so that I can prioritize response efforts.

#### Acceptance Criteria

- [x] 1. WHEN creating an Incident, THE System SHALL require a severity classification of either Critical or Warning
- [x] 2. WHEN displaying Incidents, THE System SHALL sort by severity with Critical Incidents appearing first
- [x] 3. WHEN an Incident severity is Critical, THE System SHALL use red visual indicators
- [x] 4. WHEN an Incident severity is Warning, THE System SHALL use yellow visual indicators
5. WHEN an Incident status changes, THE System SHALL update the display in real-time

### Requirement 11

**User Story:** As a community member, I want to vote on the credibility of Posts, so that the community can collectively assess misinformation.

#### Acceptance Criteria

1. WHEN a User views a Post, THE System SHALL display voting controls for credible and not credible options
2. WHEN a User submits a vote, THE System SHALL record the vote and update the Post credibility score
3. WHEN displaying a Post, THE System SHALL show the current credibility score based on all User votes
4. WHEN calculating credibility score, THE System SHALL compute the ratio of credible votes to total votes
5. WHEN a Post credibility score falls below twenty percent, THE System SHALL flag the Post as highly suspicious

### Requirement 12

**User Story:** As an analyst, I want to add contextual comments to Posts, so that I can share insights and evidence with other Users.

#### Acceptance Criteria

1. WHEN a User views a Post detail, THE System SHALL display all existing comments associated with the Post
2. WHEN a User submits a comment, THE System SHALL store the comment text, author, and timestamp
3. WHEN displaying comments, THE System SHALL order comments chronologically with newest comments first
4. WHEN a comment contains external links, THE System SHALL render the links as clickable elements
5. WHEN a User adds a comment, THE System SHALL update the Post display immediately without requiring page refresh

### Requirement 13

**User Story:** As a demo presenter, I want to control simulation playback, so that I can demonstrate the System capabilities in a controlled manner.

#### Acceptance Criteria

1. WHEN the System operates in demo mode, THE System SHALL provide playback controls for simulation speed
2. WHEN a presenter adjusts simulation speed, THE System SHALL update the rate at which Posts appear in the phylogenetic tree
3. WHEN a presenter pauses the simulation, THE System SHALL freeze the current state and prevent automatic updates
4. WHEN a presenter resumes the simulation, THE System SHALL continue from the paused state
5. WHEN the simulation completes, THE System SHALL display all Posts in the final phylogenetic tree configuration
6. WHEN a presenter triggers the reset action, THE System SHALL clear the current phylogenetic tree and reset the simulation timer to zero immediately

### Requirement 14

**User Story:** As a public user, I want the system to continuously scan for new information, so that I receive real-time updates without waiting for manual reports.

#### Acceptance Criteria

1. WHEN the System is active, the Scanner Agent SHALL autonomously ingest new Posts from configured sources (simulated or real) at a defined interval
2. WHEN new Posts are ingested, THE System SHALL automatically trigger the Verifier Agent
3. WHEN the Scanner Agent detects a high-velocity narrative, THE System SHALL flag it for immediate analysis

### Requirement 15

**User Story:** As a user, I want the system to verify facts automatically, so that I can trust the information provided.

#### Acceptance Criteria

1. WHEN the Verifier Agent analyzes a Post, THE System SHALL use GenAI to cross-reference claims against a knowledge base or internal consistency logic
2. WHEN misinformation is detected, THE System SHALL generate a "Truth Scorecard" automatically
3. WHEN a Truth Scorecard is generated, the Publisher Agent SHALL make it visible on the public dashboard
4. WHEN the System takes an action (scanning, verifying, publishing), THE System SHALL log this "Agentic Action" for transparency

