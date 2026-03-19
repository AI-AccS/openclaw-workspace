# COMMAND CENTRE - Complete Design Document with Trello Integration

## Research Sources
- ✅ Linear.app (Developer-focused speed)
- ✅ KanbanZone.com (Visual workflow excellence)
- ✅ monday.com (Portfolio management)
- ✅ Trello (Team familiarity - CURRENT TEAM TOOL)
- ✅ GitLab (DevOps integration)

---

## Trello Core Features (Team's Current Tool)

### Structure (Team Already Knows This)
```
WORKSPACES (Org-wide)
  ↓ BOARDS (Projects)
    ↓ LISTS (Columns/Statuses)
      ↓ CARDS (Tasks)
        ↓ CHECKLISTS, COMMENTS, ATTACHMENTS
```

### Key Features to Preserve (Transition-Friendly)
- **Boards & Lists** - Visual Kanban columns
- **Cards** - Task containers with rich details
- **Labels** - Color-coded priorities/categories (Red=Urgent, Yellow=High, etc.)
- **Checklists** - Subtasks within cards
- **Due Dates** - Deadline tracking with notifications
- **Members** - Assign tasks to Dawn/Human
- **Attachments** - Files, links, screenshots
- **Cover Images** - Visual board customization
- **Power-Ups** - Calendar view, voting, time tracking

### What Trello Lacks (Our Improvements)
- ❌ No multi-level hierarchy (Goals→Projects→Tasks)
- ❌ Limited reporting/metrics
- ❌ No dependency tracking
- ❌ No cycle time/throughput analytics
- ❌ No automated status updates
- ❌ No integration with code repos

### Transition Strategy
1. **Keep Trello terminology** where possible (Boards → Projects, Cards → Tasks)
2. **Add advanced features** Trello lacks (goals, metrics, dependencies)
3. **Import existing boards** if possible (via Trello API)
4. **Familiar UI pattern** so team doesn't need retraining

---

## Enhanced Architecture (Trello + Linear + monday)

### Hierarchy (Best of All Worlds)
```
🎯 GOALS (Strategic Objectives - monday.com)
    "Build autonomous businesses"
    "Achieve £0 operational cost"
    
    ↓
    📋 BOARDS/PROJECTS (Trello-style)
        "HMRC Auto-Call System"
        "Piano Learning Journey"
        "Health Transformation"
        
        ↓
        📊 PHASES/SWIMLANES (Linear cycles)
            Phase 1: UCM6308 Integration ✅
            Phase 2: ElevenLabs Voice ↻
            Phase 3: Hold Detection ⏳
            
            ↓
            🎴 CARDS/TASKS (Trello cards with superpowers)
                - Title: "Fix Google Sheets column mapping"
                - Priority: 🔴 Urgent (Trello label style)
                - Status: ✅ Done (Trello list style)
                - Assignee: Dawn
                - Dependencies: None
                - Progress: 100%
                - Checklist: 
                    ✓ Fixed parseCompanyClient()
                    ✓ Updated findClientInArray()
                    ✓ Fixed mock data
                - Attachments: Screenshots, docs
                - Comments: Activity feed
```

### Card Fields (Trello Familiar + Enhanced)
| Field | Trello Equivalent | Enhancement |
|-------|-----------------|-------------|
| Title | Card title | Action-oriented naming |
| Labels | ✅ Labels | Priority + Category (2D tagging) |
| Due Date | ✅ Due dates | With deadline warnings |
| Members | ✅ Assignees | Dawn/Human/Both |
| Checklist | ✅ Checklists | With progress % auto-calc |
| Cover | ✅ Cover images | Auto-generated progress bars |
| Attachments | ✅ Files/links | Git commit linking |
| **NEW** | Dependencies | Block/blocker tracking |
| **NEW** | Progress % | Auto-calculated from checklist |
| **NEW** | Time tracking | Estimate vs actual |
| **NEW** | Status history | Activity timeline |

### Views (Multi-Perspective)

#### 1. Board View (Trello Style - Default)
```
┌─────────────────────────────────────────────────────────┐
│  HMRC Auto-Call System                          [⋮]    │
├─────────────────────────────────────────────────────────┤
│  ┌───────┬──────────┬───────────┬──────────┬────────┐ │
│  │TODO   │ IN       │ BLOCKED   │ REVIEW   │ DONE   │ │
│  │(5)    │ PROGRESS │ (1)       │ (2)      │ (12)   │ │
│  ├───────┼──────────┼───────────┼──────────┼────────┤ │
│  │[Card] │[Card]    │[Card]     │[Card]    │[Card]  │ │
│  │[Card] │[Card]    │           │[Card]    │[Card]  │ │
│  │[Card] │          │           │          │[Card]  │ │
│  └───────┴──────────┴───────────┴──────────┴────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### 2. Goal View (monday.com Style)
```
🎯 Strategic Goals
├─ 🎯 Build Autonomous Businesses
│  ├─ 📋 HMRC Auto-Call System: 45%
│  ├─ 📋 Accountancy Automation: 20%
│  └─ 📋 Health Monitoring: 80%
│
└─ 🎯 Reach £0 Operational Cost
   ├─ 📋 Replace Manual Tasks: 35%
   └─ 📋 AI Agent Fleet: 15%
```

#### 3. Timeline View (Linear/Gantt)
```
Phase 1: UCM6308     ████████████░░  Completed
Phase 2: ElevenLabs  ████████░░░░░░  60%
Phase 3: Hold Detect ░░░░░░░░░░░░░░  0%
```

#### 4. Today's Focus View (Smart Queue)
```
🔥 PRIORITY NOW
• Fix UCM6308 AMI login [High] ⏰ Due Today
• ElevenLabs API test [High] 🔴 Blocked

⏰ DUE SOON
• Google Sheets API key rotation [Medium] Tomorrow
• Client data cleanup [Low] This Week

⏳ WAITING ON
• Hold detection algorithm [Medium] Waiting for ElevenLabs
```

---

## Technical Stack (Apple-Style + Modern)

### Recommended Stack
```
Frontend:
  • Next.js 14 (App Router) - Fast, SEO-friendly
  • Tailwind CSS - Utility-first styling
  • Shadcn/ui - Beautiful, accessible components
  • Framer Motion - Smooth animations (Linear-style)
  • dnd-kit - Drag-and-drop (Trello-style)

Backend:
  • Next.js API Routes (serverless)
  • Local JSON/SQLite (start simple)
  • TypeORM (if DB needed)

State Management:
  • Zustand - Minimal, fast
  • Optimistic updates (Linear-style speed)

Styling Philosophy:
  • Apple-like: Minimal, generous whitespace
  • High contrast: Dark mode default
  • Typography: Inter or SF Pro Display
  • Animations: Subtle, purposeful
  • Color palette: 
      - Primary: #5865F2 (Linear purple)
      - Success: #10B981
      - Warning: #F59E0B
      - Danger: #EF4444
      - Neutral: #111827 to #F9FAFB
```

### Why This Stack?
1. **Next.js** - Fast SSR, great DX, Vercel deploy
2. **Tailwind** - Rapid UI development, consistent design
3. **Shadcn/ui** - Pre-built beautiful components
4. **Framer Motion** - Smooth, polished animations
5. **dnd-kit** - Accessible drag-and-drop (Trello)

---

## PROJECT_BRAIN.md Protocol

### File Structure
```
PROJECT_BRAIN.md
├─ 📍 Current State
│  ├─ Project Path (what's being built)
│  ├─ Current Task (what's in progress)
│  └─ Next Action (what's next)
│
├─ 📋 Task Backlog
│  ├─ [ ] Todo items
│  ├─ [→] In Progress
│  └─ [✓] Done items
│
├─ 🧠 Decisions Log
│  ├─ Why Next.js?
│  ├─ Why Tailwind?
│  └─ Why Shadcn?
│
└─ 🗺️ Roadmap
   ├─ Phase 1: Core (Today)
   ├─ Phase 2: Kanban (Next)
   └─ Phase 3: Advanced (Later)
```

### Update Rules
1. **After each task completion** - Update "Current State"
2. **After each step** - Move task in backlog
3. **When choosing tech** - Log decision with reasoning
4. **Before starting work** - Check what's next

---

## Implementation Roadmap

### Phase 1: Foundation (Day 1)
- [✓] Research complete (Linear, Trello, monday, KanbanZone)
- [ ] Initialize PROJECT_BRAIN.md
- [ ] Create data schema (Goals, Projects, Tasks)
- [ ] Set up Next.js + Tailwind + Shadcn
- [ ] Build basic card component
- [ ] Create local storage persistence
- [ ] Demo: Static board with 1 project

**Vibe Check Points:**
- Card design matches Trello familiarity?
- Animations feel "Linear-speed"?
- Layout clean and Apple-like?

### Phase 2: Kanban Board (Day 2)
- [ ] Drag-and-drop functionality
- [ ] Create/Edit/Delete cards
- [ ] Status transitions (lists)
- [ ] Priority labels (Trello-style)
- [ ] Due dates
- [ ] Card details modal
- [ ] Demo: Interactive board with HMRC project

**Vibe Check Points:**
- Drag feels smooth (Framer Motion)?
- Card details easy to access?
- Trello users feel at home?

### Phase 3: Work Queue + Goals (Day 3)
- [ ] "Today's Focus" view
- [ ] Goal hierarchy (Goals→Projects→Tasks)
- [ ] Progress calculation
- [ ] Deadline sorting
- [ ] Blocked item highlighting
- [ ] Demo: Smart queue showing priorities

### Phase 4: Analytics (Day 4)
- [ ] Cycle time tracking
- [ ] Throughput metrics
- [ ] Completion rate charts
- [ ] Cumulative flow diagram
- [ ] Demo: Performance dashboard

### Phase 5: Team Features (Day 5)
- [ ] Multiple assignees
- [ ] Comments/activity feed
- [ ] File attachments
- [ ] Trello import (optional)
- [ ] Demo: Multi-user board

---

## First Task: Initialize Everything

### Deliverable
1. **PROJECT_BRAIN.md** - Created with this roadmap
2. **Data Schema** - Defined in TypeScript
3. **Next.js Project** - Initialized with Tailwind + Shadcn
4. **Basic Card Component** - Visual design ready

### Tech Stack Decision
**Chosen**: Next.js 14 + Tailwind + Shadcn + Framer Motion + dnd-kit

**Why?**
- **Speed**: Next.js is fast out-of-the-box
- **Design**: Shadcn gives Apple-like quality instantly
- **Motion**: Framer = Linear-smooth animations
- **Drag**: dnd-kit = Trello-accessible drag-and-drop
- **Familiar**: TypeScript + React = industry standard

### Immediate Next Steps
1. ✅ Update PROJECT_BRAIN.md with this plan
2. Initialize Next.js project in `business/command-centre`
3. Install Tailwind, Shadcn, Framer Motion, dnd-kit
4. Create data schema types
5. Build card component with Trello-style design
6. **SHOW DEMO** - Wait for vibe check

---

## Golden Rules

1. **Never build without checking PROJECT_BRAIN.md first**
2. **Always update PROJECT_BRAIN.md after completing work**
3. **Show demo after each step** - Get vibe check before proceeding
4. **Keep Trello users happy** - Familiar patterns first, enhancements second
5. **Apple-like quality** - Minimal, fast, polished
6. **Linear-speed** - Optimistic updates, instant feedback

---

*Created: 2026-03-19 11:50 GMT*
*Status: Research complete, ready to build Phase 1*
