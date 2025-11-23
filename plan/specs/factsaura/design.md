# Design Document

## Overview

FactSaura is a full-stack web application that tracks and visualizes misinformation propagation during crisis events. The system uses a phylogenetic approach to model how false information mutates as it spreads, treating misinformation like a biological virus with traceable lineage and mutation patterns.

The architecture consists of:
- **Frontend**: React 19 + Vite SPA with real-time visualization using React Flow
- **Backend**: FastAPI Python server providing RESTful APIs
- **Database**: PostgreSQL with Prisma ORM for type-safe data access
- **AI Layer**: Gemini API integration for content analysis and risk assessment
- **Agentic Layer**: Autonomous agents for continuous scanning, verification, and reporting
- **Text Analysis**: Python-Levenshtein library for mutation score calculation

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Crisis Feed  │  │ Phylogenetic │  │  Submission  │      │
│  │   View       │  │  Tree View   │  │   Portal     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    TanStack Query                            │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────┼────────────────────────────────┐
│                     FastAPI Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Incident   │  │     Post     │  │   Analysis   │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                     Prisma Client                            │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                      PostgreSQL                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Incidents  │  │    Posts     │  │   Comments   │      │
│  │    Table     │  │    Table     │  │    Table     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘

External Services:
┌──────────────┐
│  Gemini API  │  (Content Analysis & Risk Assessment)
└──────────────┘

### Agentic Layer
The system employs a multi-agent architecture to achieve autonomous operation:

1.  **Scanner Agent (Perception)**: Continuously "scans" simulated social media feeds (or real APIs) to detect emerging narratives. It acts as the system's eyes, ingesting data without human intervention.
2.  **Verifier Agent (Reasoning)**: Automatically analyzes ingested posts using LLMs to detect misinformation patterns, cross-reference facts, and assign credibility scores.
3.  **Publisher Agent (Action)**: Generates and "publishes" contextual updates (Truth Scorecards, Community Notes) to the public facing dashboard when high-risk misinformation is detected.
```

### Technology Stack Rationale

**Frontend:**
- React 19: Latest stable version with improved concurrent rendering
- Vite: Fast build tool with HMR for rapid development
- React Flow: Specialized library for node-based graph visualization
- TanStack Query: Handles caching, synchronization, and server state management with **short polling (2-5 second intervals)** for real-time updates
- Tailwind CSS: Utility-first styling for rapid UI development
- Framer Motion: Smooth animations for glassmorphism effects

**Real-Time Strategy:**
The system achieves "real-time" updates through **short polling** using TanStack Query's automatic refetch capabilities. This approach is more reliable for hackathon demos than WebSockets, as it doesn't require persistent connections and handles network interruptions gracefully. The frontend polls the backend every 2-5 seconds for updated incident and post data.

**Backend:**
- FastAPI: Async Python framework with automatic OpenAPI documentation
- Python 3.10+: Modern Python with type hints for better code quality
- Prisma Client Python: Type-safe ORM with schema migrations
- python-Levenshtein: Fast C-based implementation for text similarity

**Database:**
- PostgreSQL: Robust relational database with excellent JSON support for flexible data storage

## Components and Interfaces

### Frontend Components

#### 1. Crisis Monitor Feed Component
**Purpose**: Display all active incidents in a scrollable dashboard

**Props:**
```typescript
interface CrisisMonitorProps {
  incidents: Incident[];
  onIncidentSelect: (incidentId: string) => void;
}
```

**State:**
- Loading state for data fetching
- Selected incident ID
- Filter/sort preferences

**Key Features:**
- Glassmorphism card styling
- Dynamic border colors based on viral velocity
- Real-time statistics display
- Responsive grid layout

#### 2. Phylogenetic Tree Component
**Purpose**: Visualize misinformation evolution as an interactive graph

**Props:**
```typescript
interface PhylogeneticTreeProps {
  incidentId: string;
  posts: Post[];
  onNodeClick: (postId: string) => void;
}
```

**State:**
- Selected node
- Zoom/pan position
- Layout algorithm state

**Key Features:**
- React Flow integration for node rendering
- Custom edge styling based on mutation scores
- Interactive node selection
- Diff view side panel

**Data Transformation Strategy:**
React Flow requires `Node[]` and `Edge[]` arrays with x/y coordinates, not raw `Post[]` objects. For hackathon speed and flexibility, we'll handle the transformation on the **frontend**:

1. Backend API returns raw `Post[]` with parent-child relationships
2. Frontend utility function `transformPostsToReactFlow(posts: Post[])` converts to React Flow format:
   - Calculates x/y positions using a tree layout algorithm (dagre or elkjs)
   - Creates Node objects with proper positioning
   - Creates Edge objects with mutation score styling
3. This approach keeps the backend simple and allows rapid iteration on visualization layout

```typescript
interface ReactFlowNode {
  id: string;
  type: 'post';
  position: { x: number; y: number };
  data: Post;
}

interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  style: { stroke: string }; // Color based on mutation score
}
```

#### 3. Submission Portal Component
**Purpose**: Allow users to submit suspicious content for analysis

**Props:**
```typescript
interface SubmissionPortalProps {
  onSubmit: (content: string) => Promise<AnalysisResult>;
}
```

**State:**
- Input text
- Submission status (idle, scanning, complete)
- Analysis results

**Key Features:**
- Text input with validation
- Animated scanning feedback
- Truth scorecard display
- Match visualization

### Backend Services

#### 1. Incident Service
**Responsibilities:**
- CRUD operations for incidents
- Retrieve incidents with filtering and sorting
- Calculate viral velocity metrics

**Key Methods:**
```python
async def get_all_incidents(severity_filter: Optional[str] = None) -> List[Incident]
async def get_incident_by_id(incident_id: str) -> Incident
async def create_incident(incident_data: IncidentCreate) -> Incident
async def update_incident_status(incident_id: str, status: str) -> Incident
```

#### 2. Post Service
**Responsibilities:**
- CRUD operations for posts
- Build phylogenetic tree structures
- Calculate mutation scores between posts

**Key Methods:**
```python
async def get_posts_by_incident(incident_id: str) -> List[Post]
async def create_post(post_data: PostCreate) -> Post
async def link_post_to_parent(child_id: str, parent_id: str) -> Post
async def calculate_mutation_score(child_content: str, parent_content: str) -> float
async def build_tree_structure(incident_id: str) -> TreeNode
```

#### 3. Analysis Service
**Responsibilities:**
- Fuzzy matching against existing posts
- AI-powered content analysis
- Risk assessment and classification

**Key Methods:**
```python
async def find_similar_posts(content: str, threshold: float = 0.8) -> List[PostMatch]
async def analyze_new_content(content: str) -> AnalysisResult
async def generate_truth_scorecard(content: str, matches: List[PostMatch]) -> TruthScorecard
```

### API Endpoints

#### Incident Endpoints
```
GET    /api/incidents              - List all incidents
GET    /api/incidents/{id}         - Get incident details
POST   /api/incidents              - Create new incident
PATCH  /api/incidents/{id}         - Update incident
```

#### Post Endpoints
```
GET    /api/incidents/{id}/posts   - Get all posts for incident
GET    /api/posts/{id}             - Get post details
POST   /api/posts                  - Create new post
GET    /api/posts/{id}/tree        - Get phylogenetic tree
```

#### Analysis Endpoints
```
POST   /api/analyze                - Submit content for analysis
GET    /api/posts/{id}/diff        - Get diff between post and parent
```

#### Community Endpoints
```
POST   /api/posts/{id}/vote        - Vote on post credibility
GET    /api/posts/{id}/comments    - Get post comments
POST   /api/posts/{id}/comments    - Add comment to post
```

#### Demo Endpoints
```
POST   /api/demo/reset             - Reset simulation
PATCH  /api/demo/speed             - Adjust simulation speed
POST   /api/demo/pause             - Pause simulation
POST   /api/demo/resume            - Resume simulation
```

## Data Models

### Prisma Schema

```prisma
model Incident {
  id        String   @id @default(uuid())
  title     String
  severity  Severity
  location  String
  status    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

enum Severity {
  CRITICAL
  WARNING
}

model Post {
  id            String        @id @default(uuid())
  content       String
  author        String
  timestamp     DateTime      @default(now())
  incidentId    String
  incident      Incident      @relation(fields: [incidentId], references: [id])
  parentId      String?
  parent        Post?         @relation("PostHierarchy", fields: [parentId], references: [id])
  children      Post[]        @relation("PostHierarchy")
  mutationScore Float?
  mutationType  MutationType?
  credibleVotes Int           @default(0)
  totalVotes    Int           @default(0)
  comments      Comment[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum MutationType {
  EMOTIONAL
  FACTUAL
  FABRICATION
}

model Comment {
  id        String   @id @default(uuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
  author    String
  content   String
  createdAt DateTime @default(now())
}

model DemoState {
  id              String   @id @default(uuid())
  speed           Float    @default(1.0)
  isPaused        Boolean  @default(false)
  currentPosition Int      @default(0)
  updatedAt       DateTime @updatedAt
}
```

### TypeScript Interfaces

```typescript
interface Incident {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING';
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  incidentId: string;
  parentId?: string;
  mutationScore?: number;
  mutationType?: 'EMOTIONAL' | 'FACTUAL' | 'FABRICATION';
  credibleVotes: number;
  totalVotes: number;
}

interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
}

interface TreeNode {
  post: Post;
  children: TreeNode[];
  depth: number;
}

interface AnalysisResult {
  matchFound: boolean;
  matchPercentage: number;
  relatedPosts: Post[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Temporal Consistency
*For any* post with a parent post, the child post's timestamp MUST always be greater than or equal to its parent post's timestamp. Time cannot move backward in the misinformation propagation chain.

### Property 2: Mutation Bounds
*For any* mutation score calculated between two posts, the value MUST always be between 0.0 and 100.0 (inclusive). No mutation score can exist outside this range.

### Property 3: Graph Integrity (Acyclic Tree)
*For any* post in the phylogenetic tree, following the parent chain upward MUST eventually reach a root node (post with no parent). The tree MUST NOT contain cycles where a post is its own ancestor.

