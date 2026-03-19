# 🧠 PROJECT_BRAIN.md

> Single source of truth. Updated after every task. Never start work without checking here first.

---

## 📍 Current State

**Last Updated**: 2026-03-19 11:50 GMT

### Project Path
```
🎯 Build Command Centre (Project Management System)
  └─ 📦 Phase 1: Foundation (IN PROGRESS)
       ├─ ✅ Research complete (Linear, Trello, monday, KanbanZone)
       ├─ ✅ Design document created (COMMAND-CENTRE-DESIGN.md)
       ├─ ✅ PROJECT_BRAIN.md initialized
       ├─ ⏳ Data schema definition ← CURRENT TASK
       ├─ ⏳ Next.js project initialization ← NEXT
       └─ ⏳ Basic card component ← AFTER NEXT
```

### What I'm Doing Now
**Defining the data schema in TypeScript** - Creating the foundational data structures for Goals, Projects, Phases, and Tasks. This will be the backbone of everything.

### What's Next
**Initialize Next.js project** with:
- Tailwind CSS (styling)
- Shadcn/ui (beautiful components)
- Framer Motion (smooth animations)
- dnd-kit (drag-and-drop)

### What to Build After
**Card component** - The visual building block that Trello users will recognize.

---

## 📋 Task Backlog

### Phase 1: Foundation (Day 1) - 40% Complete
- [x] **Research industry leaders** - Linear, Trello, monday, KanbanZone
- [x] **Create design document** - COMMAND-CENTRE-DESIGN.md with full architecture
- [x] **Initialize PROJECT_BRAIN.md** - This file as single source of truth
- [ ] **Define data schema** - TypeScript types for Goals, Projects, Tasks ← **CURRENT**
- [ ] **Set up Next.js project** - With Tailwind, Shadcn, Framer, dnd-kit
- [ ] **Build basic card component** - Trello-style with priority labels
- [ ] **Create local storage** - JSON-based persistence
- [ ] **Demo: Static board** - Show 1 project with 3 tasks

### Phase 2: Kanban Board (Day 2)
- [ ] **Drag-and-drop functionality** - Trello-style card movement
- [ ] **Create/Edit/Delete cards** - CRUD operations
- [ ] **Status transitions** - Move cards between lists
- [ ] **Priority labels** - Color-coded urgency
- [ ] **Due dates** - Deadline tracking
- [ ] **Card details modal** - Expand card for full info
- [ ] **Demo: Interactive board** - HMRC project with real tasks

### Phase 3: Work Queue + Goals (Day 3)
- [ ] **"Today's Focus" view** - Smart priority queue
- [ ] **Goal hierarchy** - Goals → Projects → Tasks structure
- [ ] **Progress calculation** - Auto-compute from subtasks
- [ ] **Deadline sorting** - Urgent items rise to top
- [ ] **Blocked item highlighting** - Visual blockers
- [ ] **Demo: Smart queue** - Priority-based task display

### Phase 4: Analytics (Day 4)
- [ ] **Cycle time tracking** - How long tasks take
- [ ] **Throughput metrics** - Tasks completed per week
- [ ] **Completion rate charts** - Progress over time
- [ ] **Cumulative flow diagram** - Bottleneck visualization
- [ ] **Demo: Performance dashboard** - Metrics and insights

### Phase 5: Team Features (Day 5)
- [ ] **Multiple assignees** - Dawn/Human/Both
- [ ] **Comments/activity feed** - Task conversations
- [ ] **File attachments** - Screenshots, docs
- [ ] **Trello import** - Optional migration tool
- [ ] **Demo: Multi-user board** - Collaborative features

---

## 🧠 Decisions Log

### Why Next.js 14?
**Decision**: Use Next.js 14 with App Router

**Reasoning**:
- ✅ Server-side rendering = instant page loads
- ✅ Great developer experience (DX)
- ✅ Easy Vercel deployment
- ✅ Built-in API routes (no separate backend needed)
- ✅ TypeScript first-class support
- ✅ Industry standard, huge ecosystem

**Alternatives Considered**:
- ❌ Plain React + Vite - No SSR, more setup needed
- ❌ Vue/Nuxt - Smaller ecosystem, team familiarity with React
- ❌ SvelteKit - Newer, less Shadcn support

---

### Why Tailwind CSS?
**Decision**: Tailwind for all styling

**Reasoning**:
- ✅ Utility-first = rapid UI development
- ✅ Consistent design system out-of-the-box
- ✅ No CSS-in-JS overhead
- ✅ Excellent Shadcn/ui integration
- ✅ Industry standard now
- ✅ Small bundle size (PurgeCSS)

**Alternatives**:
- ❌ Plain CSS - Slower, less consistent
- ❌ SCSS - Compile step, less modern
- ❌ Styled Components - Runtime overhead
- ❌ Chakra UI - Less customizable than Shadcn

---

### Why Shadcn/ui?
**Decision**: Shadcn for pre-built components

**Reasoning**:
- ✅ Beautiful, Apple-like design quality
- ✅ Accessible out-of-the-box (WCAG compliant)
- ✅ Copy-paste components (not a library = full control)
- ✅ Tailwind-based (consistent with our stack)
- ✅ Dark mode ready
- ✅ Active development, well-maintained

**Alternatives**:
- ❌ Material UI - Google design, not Apple-like
- ❌ Radix UI - Good but less polished UI
- ❌ Mantine - Library-based, less flexible
- ❌ Chakra UI - Slower performance

---

### Why Framer Motion?
**Decision**: Framer Motion for animations

**Reasoning**:
- ✅ Linear-style smooth animations
- ✅ Declarative API (easy to use)
- ✅ Gestures built-in (drag, pan, tap)
- ✅ Layout animations (smooth reordering)
- ✅ Production-ready, well-tested
- ✅ Great performance (GPU accelerated)

**Alternatives**:
- ❌ GSAP - More complex, overkill
- ❌ React Spring - Good but smaller ecosystem
- ❌ CSS transitions - Limited, less smooth
- ❌ Anime.js - Not React-optimized

---

### Why dnd-kit?
**Decision**: dnd-kit for drag-and-drop

**Reasoning**:
- ✅ Accessible (keyboard support, ARIA)
- ✅ Modern React hooks API
- ✅ Small bundle size
- ✅ Highly customizable
- ✅ Trello-like drag behavior
- ✅ Active maintenance

**Alternatives**:
- ❌ react-beautiful-dnd - No longer maintained
- ❌ react-dnd - Heavier, more complex
- ❌ native HTML5 DnD - Inaccessible, inconsistent

---

### Why JSON/Local Storage (Not DB Initially)?
**Decision**: Start with JSON file + localStorage

**Reasoning**:
- ✅ Fastest to prototype
- ✅ No database setup needed
- ✅ Easy to version control
- ✅ Can migrate to DB later
- ✅ Perfect for single-user MVP
- ✅ Zero infra cost

**Future Migration Path**:
1. JSON → SQLite (local)
2. SQLite → PostgreSQL (cloud)
3. Add multi-user support later

---

### Why Trello-First Design?
**Decision**: Prioritize Trello familiarity over new features

**Reasoning**:
- ✅ Team already knows Trello = zero learning curve
- ✅ Easier adoption = faster value
- ✅ Can add advanced features later
- ✅ Lower friction = less resistance
- ✅ Familiar mental model = less confusion

**Trade-offs**:
- ⚠️ Some advanced features deferred (dependencies, goals)
- ⚠️ Not "reinventing the wheel" initially
- ✅ Can enhance after adoption

---

## 🗺️ Roadmap

### Timeline Overview
```
Day 1 (Today): Foundation
  11:50 → Data schema definition
  12:00 → Next.js setup
  13:00 → Card component
  14:00 → Demo 1 (Static board)
  15:00 → Vibe check

Day 2: Kanban
  → Drag-and-drop
  → CRUD operations
  → Demo 2 (Interactive)
  → Vibe check

Day 3: Work Queue
  → Smart priority system
  → Goals hierarchy
  → Demo 3 (Today's Focus)
  → Vibe check

Day 4: Analytics
  → Metrics, charts
  → Demo 4 (Dashboard)
  → Vibe check

Day 5: Team Features
  → Collaboration tools
  → Final demo
  → Launch
```

### Milestones
1. ✅ **Research Complete** - All major PM tools analyzed
2. ✅ **Design Finalized** - COMMAND-CENTRE-DESIGN.md approved
3. ⏳ **MVP Launch** - Basic working system (Day 3)
4. ⏳ **Full Feature Set** - All phases complete (Day 5)
5. ⏳ **Team Adoption** - Replace Trello usage
6. ⏳ **Automation Integration** - Connect to GitHub, etc.

---

## ⚠️ Critical Reminders

### Golden Rules
1. ✅ **Always check PROJECT_BRAIN.md before starting work**
2. ✅ **Update this file after completing ANY task**
3. ✅ **Show demo after each phase** - Wait for vibe check
4. ✅ **Never duplicate work** - This prevents the HMRC UI mistake
5. ✅ **Keep it simple** - MVP first, features later

### Lessons Learned
- ❌ **MISTAKE**: Built duplicate HMRC UI on 2026-03-19
- ✅ **LESSON**: No task tracking = duplicate work
- ✅ **SOLUTION**: PROJECT_BRAIN.md as single source of truth
- ✅ **PREVENTION**: Check here before coding anything

### What Success Looks Like
- ✅ Dawn always knows what to work on
- ✅ No duplicate code ever again
- ✅ Team sees progress clearly
- ✅ Priorities are obvious
- ✅ Completed work is logged
- ✅ Next actions are clear

---

*Last updated: 2026-03-19 11:50 GMT by Dawn*
*Next update: After data schema is defined*
