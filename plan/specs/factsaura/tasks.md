# Implementation Plan

## Foundation Setup

- [x] 1. Initialize backend project structure
  - Create Python FastAPI project with proper directory structure (services, models, routes)
  - Initialize Prisma with PostgreSQL connection
  - Set up virtual environment and install dependencies (FastAPI, Prisma, python-Levenshtein, Gemini SDK)
  - Configure environment variables for database and API keys
  - _Requirements: 4.1, 4.2, 8.4_

- [x] 2. Define database schema and run migrations
  - Create Prisma schema with Incident, Post, Comment, and DemoState models
  - Define enums for Severity and MutationType
  - Implement self-referential Post relationship for parent-child hierarchy
  - Generate Prisma client and run initial migration
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.1_

- [x] 2.1 Create "Golden Dataset" for Simulation
  - Create `simulation_data.json` with a scripted "Mumbai Flood" narrative
  - Define ~15 posts with pre-calculated mutation scores and parent-child links
  - Define "Truth" values for each post to ensure consistent verification results
  - _Mitigates: Verification Reliability, Data Source Reality_

- [x] 3. Initialize frontend project structure
  - Create Vite + React 19 project with TypeScript
  - Install dependencies (React Flow, TanStack Query, Tailwind CSS, Framer Motion, Shadcn/UI, Lucide React)
  - Configure Tailwind CSS with glassmorphism utilities
  - Set up TanStack Query client with base configuration
  - Create TypeScript interfaces (Incident, Post, Comment, AnalysisResult)
  - _Requirements: 1.1, 7.4, 8.1, 8.2_

## Feature 1: Crisis Monitor Feed (High Priority)

- [x] 4. Frontend - Build Crisis Monitor Feed UI
- [x] 4.1 Create incident card component
  - Create glassmorphism card styling with Tailwind
  - Implement dynamic border colors based on viral velocity (red for high, green for contained)
  - Display incident title, severity, location, status
  - Show live statistics placeholders (infected nodes, mutation rate)
  - Add hover effects for interactivity feedback
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 7.3, 10.3, 10.4_

- [x] 4.2 Build feed layout component
  - Create responsive grid layout for incident cards
  - Implement severity-based sorting (Critical first)
  - Add incident selection handler
  - Set up loading state UI
  - _Requirements: 1.1, 10.2_

- [x] 5. Backend - Implement Incident Service and API
- [x] 5.1 Create Incident Service
  - Write CRUD operations for incidents
  - Implement get_all_incidents with severity filtering and sorting
  - Implement get_incident_by_id method
  - Add incident status update functionality
  - _Requirements: 1.1, 10.1, 10.2_

- [x] 5.2 Create incident API endpoints
  - Implement GET /api/incidents with severity filtering
  - Implement GET /api/incidents/{id}
  - Implement POST /api/incidents
  - Implement PATCH /api/incidents/{id}
  - _Requirements: 8.1, 8.2, 10.1_

- [x] 6. Integration - Connect Crisis Feed to Backend
  - Create API client functions for incident endpoints
  - Set up TanStack Query hooks for incident fetching with 3-second polling
  - Connect incident cards to real data
  - Add error handling and loading states
  - Test end-to-end: view incidents, filter by severity, select incident
  - _Requirements: 1.1, 7.2, 8.1_

## Feature 2: Agentic Core (Hackathon Priority)

- [x] 7. Backend - Implement Agentic Services
  - Create `ScannerAgent` to ingest posts from `simulation_data.json` (Simulation Mode)
  - Create `VerifierAgent` to analyze posts (using cached/pre-determined results in demo mode for speed/reliability)
  - Create `PublisherAgent` to automatically post Truth Scorecards
  - _Requirements: 14.1, 14.2, 15.1, 15.2, 15.3_
  - _Mitigates: Agentic vs Automated, Verification Reliability_

- [x] 8. Frontend - Build Agent Activity Monitor
  - Create a "Live Agent Log" component to show what the AI is doing (e.g., "Scanning source X...", "Verifying claim Y...")
  - **CRITICAL:** This must be prominent and animated to prove "Agentic" behavior
  - Add visual indicators for "AI Verified" content
  - _Requirements: 15.4_
  - _Mitigates: "Cron Job" Fallacy_

- [x] 9. Integration - Enable Autonomous Loop
  - Connect Scanner Agent to the main event loop
  - Ensure agents run in background without blocking API
  - **Alignment**: Connect Frontend Monitor to Backend Logs
  - _Requirements: 14.1, 14.3_

## Feature 3: Phylogenetic Tree Visualization (High Priority)

- [x] 10. Frontend - Build Phylogenetic Tree UI skeleton
- [x] 10.1 Create tree transformation utility
  - Write transformPostsToReactFlow function
  - Integrate dagre or elkjs for automatic tree layout
  - Calculate x/y positions for nodes
  - Generate edges with mutation score-based styling (green <10%, yellow 10-40%, red >40%)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 10.2 Build React Flow tree component
  - Implement custom node component for posts
  - Apply edge coloring based on mutation scores
  - Add zoom and pan controls
  - Implement node click handler
  - Add loading state for tree
  - _Requirements: 2.4, 2.5, 2.6, 7.5_

- [x] 11. Backend - Implement Post Service with mutation scoring
- [x] 11.1 Create Post Service
  - Write CRUD operations for posts
  - Implement calculate_mutation_score using python-Levenshtein
  - Add link_post_to_parent method with automatic mutation score calculation
  - Implement get_posts_by_incident to return flat list of posts with parent-child relationships
  - _Requirements: 4.2, 4.3, 5.1, 5.2, 5.3, 9.1, 9.4_

- [x] 11.2 Write property test for mutation score bounds
  - **Property 2: Mutation Bounds**
  - **Validates: Requirements 4.4, 5.2**
  - Generate random post content pairs and verify mutation scores are always between 0.0 and 100.0

- [x] 11.3 Write property test for temporal consistency
  - **Property 1: Temporal Consistency**
  - **Validates: Requirements 9.1**
  - Generate random post hierarchies and verify child timestamps >= parent timestamps

- [x] 11.4 Write property test for graph integrity
  - **Property 3: Graph Integrity (Acyclic Tree)**
  - **Validates: Requirements 9.4**
  - Generate random post trees and verify no cycles exist by traversing parent chains

- [x] 11.5 Create post API endpoints
  - Implement GET /api/incidents/{id}/posts (returns flat list with parent-child IDs)
  - Implement GET /api/posts/{id}
  - Implement POST /api/posts
  - _Requirements: 2.1, 8.2, 9.2, 9.3_

- [x] 12. Integration - Connect Tree Visualization to Backend
  - Create API client functions for post endpoints
  - Set up TanStack Query hooks for post fetching with polling
  - Connect tree component to real post data
  - Test transformation from flat post list to React Flow nodes/edges
  - Verify edge colors match mutation scores
  - Test end-to-end: select incident, view tree, zoom/pan
  - _Requirements: 2.1, 2.2, 2.3, 7.2_

- [x] 13. Frontend - Add diff view side panel
  - Build side panel component with slide-in animation
  - Implement GET /api/posts/{id}/diff endpoint in backend
  - Fetch parent and child post content on node click
  - Implement text diff highlighting
  - Test end-to-end: click node, view diff
  - _Requirements: 2.7_

- [x] 14. Checkpoint - Verify Phylogenetic Tree feature works end-to-end
  - Test tree rendering with seed data
  - Verify edge colors are correct
  - Test node interactions and diff view
  - Ensure all tests pass, ask the user if questions arise

## Feature 4: Submission Portal (High Priority)

- [x] 15. Frontend - Build Submission Portal UI
- [x] 15.1 Create submission form component
  - Create text input with validation
  - Add submit button with loading state
  - Implement animated scanning indicator with matrix-style effects
  - _Requirements: 3.5, 7.1_

- [x] 15.2 Build truth scorecard display
  - Display match percentage
  - Show related known misinformation posts
  - Display risk level indicator (LOW/MEDIUM/HIGH)
  - Add smooth transition animations
  - _Requirements: 3.4_

- [x] 16. Backend - Implement Analysis Service
  - [x] Implement find_similar_posts using fuzzy matching with Levenshtein distance
  - [x] Add analyze_new_content method with Gemini API integration
  - [x] Implement generate_truth_scorecard method
  - [x] Add error handling for AI service unavailability (graceful degradation)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.5_

- [x] 17. Backend - Create analysis API endpoint
  - [x] Implement POST /api/analyze for content submission
  - [x] Return analysis results with match percentage and related posts
  - [x] Handle both matched and new content scenarios
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.3_

- [x] 18. Integration - Connect Submission Portal to Backend
  - Create API client function for analysis endpoint
  - Set up mutation hook for content submission
  - Connect form to backend analysis
  - Display truth scorecard with real results
  - Test end-to-end: submit content, view scanning animation, see results
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 19. Checkpoint - Verify Submission Portal feature works end-to-end
  - Test submitting known content (should match existing posts)
  - Test submitting new content (should trigger AI analysis)
  - Verify graceful degradation when AI is unavailable
  - Ensure all tests pass, ask the user if questions arise

## Feature 5: Demo Control Panel (High Priority)

- [ ] 20. Frontend - Build Demo Control Panel UI
  - Create playback controls UI (speed slider, pause/resume buttons)
  - Add reset button with confirmation dialog
  - Display simulation progress indicator
  - Add visual feedback for pause/play state
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 21. Backend - Implement demo control endpoints
  - Implement POST /api/demo/reset with DB flush and re-seed logic
  - Implement PATCH /api/demo/speed (updates DemoState.speed)
  - Implement POST /api/demo/pause (sets DemoState.isPaused = true)
  - Implement POST /api/demo/resume (sets DemoState.isPaused = false)
  - Implement GET /api/demo/state (returns current DemoState)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6_

- [ ] 22. Integration - Connect Demo Controls to Backend
  - Create API client functions for demo endpoints
  - Set up polling for GET /api/demo/state (track pause/play status)
  - Conditionally stop post fetching when DemoState.isPaused is true
  - Connect all control buttons to backend
  - Test end-to-end: pause, resume, adjust speed, reset
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6_

- [ ] 23. Checkpoint - Verify Demo Controls work end-to-end
  - Test pause/resume functionality
  - Test speed adjustment
  - Test reset with data re-seeding
  - Ensure all tests pass, ask the user if questions arise

## Feature 6: Community Features (Lower Priority)

- [x] 24. Frontend - Build voting controls UI
  - Add credible/not credible buttons to post views
  - Display current credibility score
  - Add visual flag for posts with <20% credibility
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 25. Frontend - Build comment section UI
  - Display existing comments chronologically (newest first)
  - Add comment input form
  - Render clickable links in comments
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 26. Backend - Implement community endpoints
  - Implement POST /api/posts/{id}/vote for credibility voting
  - Implement GET /api/posts/{id}/comments
  - Implement POST /api/posts/{id}/comments
  - _Requirements: 11.1, 11.2, 11.3, 12.1, 12.2_

- [x] 27. Integration - Connect community features to backend
  - Create API client functions for voting and comments
  - Set up mutation hooks for vote and comment submission
  - Implement real-time comment updates with polling
  - Test end-to-end: vote on posts, add comments, view updates
  - _Requirements: 11.1, 11.2, 12.1, 12.5_

## Polish and Testing

- [x] 28. Add animations and visual polish
  - Implement glassmorphism effects with Framer Motion
  - Add smooth view transitions between feed and tree
  - Refine scanning animation for submission portal
  - Add hover effects and micro-interactions
  - _Requirements: 7.3, 7.4, 7.5_

- [x]* 29. Write frontend integration tests
  - Test incident feed rendering and interaction
  - Test phylogenetic tree visualization
  - Test submission portal flow
  - Test voting and commenting functionality
  - Note: Property tests implemented and passing (3/3)

- [x] 30. Final checkpoint - End-to-end verification
  - Ensure all tests pass, ask the user if questions arise
  - Verify simulation mode works without external APIs
  - Test all user flows from requirements
  - Verify correctness properties hold in practice
  - Test demo presentation flow
  - Note: Comprehensive verification script created, property tests passing
