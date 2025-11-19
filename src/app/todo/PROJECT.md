# Todo List Feature - Project Tracking

## Project Overview
Building a hierarchical todo list page for the sullivansoftware.dev portfolio. Inspired by Jira/Scrum, the feature supports three-level nesting with localStorage persistence.

**Theme:** Japanese Retro (matching existing design system)
**Storage:** Browser localStorage
**Status:** In Progress

---

## Feature Requirements

### Core Structure
- **Level 1:** Epics (top-level grouping)
- **Level 2:** Stories (within Epics)
- **Level 3:** Tasks (within Stories)

### Interactions
- [x] Drag and drop to reorder items at same level
- [x] Drag and drop to move items between parent containers
- [x] Dropdown menu to select item type (Epic/Story/Task)
- [x] Complete items without deletion (archive functionality)
- [x] Trash icon to delete items
- [x] Archive area for completed items
- [x] Restore items from archive

### Data Persistence
- localStorage serialization of nested structure
- Persist on every change
- Load from localStorage on page mount

---

## Design System Integration

### Color Usage
- **Primary:** Saddle Brown (#8B4513) - main buttons, borders
- **Secondary:** Dark Slate Gray (#2F4F4F) - headers, secondary elements
- **Accent:** Burnt Orange (#FF6F00) - highlights, interactive states
- **Background:** Cornsilk (#FFF8DC)
- **Paper:** Floral White (#FFFAF0)

### Styling Patterns
- Card pattern: `p-6 bg-paper rounded-lg border-2 border-primary/20`
- Button pattern: `px-8 py-4 bg-primary text-white rounded-lg shadow-md hover:shadow-xl`
- Transitions: `transition-all duration-300`
- Border radius: 4-8px

### Animations
- Fade-in on load
- Scale/translate on hover
- Smooth transitions for drag operations
- Slide animations for adding/removing items

---

## Technical Architecture

### File Structure
```
/src/app/todo/
├── page.tsx                 # Main todo page component
├── PROJECT.md              # This file
└── components/
    ├── TodoItem.tsx         # Individual todo item component
    ├── EpicSection.tsx      # Epic container with stories
    ├── TodoForm.tsx         # Input form for new todos
    └── ArchiveSection.tsx   # Archive view for completed items

/src/lib/
└── useTodos.ts            # Custom hook for todo logic & localStorage
```

### Data Model
```typescript
interface Todo {
  id: string;              // UUID or timestamp-based
  title: string;
  type: 'epic' | 'story' | 'task';
  completed: boolean;
  createdAt: number;       // timestamp
  parentId?: string;       // Reference to parent epic/story
  order: number;           // For drag-and-drop sorting
  archived: boolean;       // Soft delete
}
```

### localStorage Key
- Key: `todos_data`
- Value: JSON-stringified array of Todo objects

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Create `/src/app/todo/page.tsx` with "use client" directive
- [ ] Create `/src/lib/useTodos.ts` custom hook
- [ ] Set up localStorage integration
- [ ] Basic todo data model

### Phase 2: Core Components
- [ ] TodoItem component (display single item)
- [ ] TodoForm component (add new item)
- [ ] EpicSection component (epic with nested stories/tasks)
- [ ] ArchiveSection component (show archived items)

### Phase 3: Interactions
- [ ] Add/edit/delete functionality
- [ ] Complete/uncomplete toggle
- [ ] Archive/restore functionality
- [ ] Drag and drop (using react-beautiful-dnd or native drag API)
- [ ] Type dropdown selector

### Phase 4: Polish
- [ ] Japanese Retro styling consistency
- [ ] Animations (fade-in, transitions)
- [ ] Responsive design
- [ ] Empty state messaging
- [ ] Performance optimization

### Phase 5: Testing & Refinement
- [ ] Test localStorage persistence
- [ ] Test drag-and-drop across items
- [ ] Test nesting behavior
- [ ] Browser compatibility

---

## Key Decisions

### Drag and Drop Library
**Decision:** Use HTML5 native drag-and-drop API initially, with potential for react-beautiful-dnd upgrade later
**Rationale:** Simpler implementation, no additional dependencies, meets requirements

### localStorage vs IndexedDB
**Decision:** localStorage (5-10MB limit)
**Rationale:** Simpler API, sufficient for personal todo list, upgrade path available to IndexedDB

### State Management
**Decision:** React `useState` with custom `useTodos` hook
**Rationale:** No need for Redux/Zustand, custom hook encapsulates all logic

---

## Learning Experience Notes
- This can be extended to IndexedDB for learning purposes
- Potential future: Add sync to backend API
- Potential future: Add filtering, search, analytics
- Consider adding keyboard shortcuts (e.g., Cmd+K to add todo)

---

## Component Hierarchy
```
TodoPage (page.tsx)
├── TodoForm (add new epic)
├── MainSection
│   └── EpicSection (per epic)
│       ├── TodoItem (epic header)
│       └── StorySection (per story)
│           ├── TodoItem (story header)
│           └── TaskItem (per task)
│               └── TodoItem (task)
└── ArchiveSection
    ├── EpicSection (archived)
    └── StorySection (archived)
    └── TaskItem (archived)
```

---

## Notes for Future Reference
- Keep upgrade path to IndexedDB in mind (separation of concerns in hooks)
- Consider localStorage quota management if feature grows
- Archive items should remain searchable/filterable in the future
- Potential for keyboard navigation shortcuts
- Consider undo/redo functionality for power users

---

## Implementation Status

### ✅ COMPLETED - November 19, 2025

All core features have been implemented and tested:

1. **Data Persistence** - localStorage implementation with JSON serialization
2. **Hierarchical Structure** - Epic → Story → Task nesting fully functional
3. **Drag and Drop** - Native HTML5 drag-and-drop for reordering and moving items
4. **Archive System** - Soft-delete with restore capability
5. **Editing** - Inline editing of todo titles
6. **Completion States** - Toggle complete/incomplete status
7. **Japanese Retro Styling** - Consistent with site theme (brown, slate colors, corner accents)
8. **Animations** - Fade-in effects and smooth transitions
9. **Responsive Design** - Mobile and desktop views supported

### Files Created

#### Core Logic
- `/src/lib/useTodos.ts` - Custom React hook with all todo management logic

#### Components
- `/src/app/todo/components/TodoItem.tsx` - Individual todo item display with actions
- `/src/app/todo/components/TodoForm.tsx` - Input form for creating new todos
- `/src/app/todo/components/EpicSection.tsx` - Epic container with nested Stories/Tasks
- `/src/app/todo/components/ArchiveSection.tsx` - Archive view for completed items

#### Pages
- `/src/app/todo/page.tsx` - Main todo page with header and layout
- `/src/app/todo/PROJECT.md` - This documentation file

### Key Features Implemented

#### 1. Storage
- Automatic localStorage sync on every change
- JSON serialization of nested todo structure
- Graceful error handling and fallbacks

#### 2. Interactions
- **Add Items**: Form with type selector (Epic/Story/Task)
- **Complete Items**: Checkbox to mark done without deletion
- **Edit Items**: Click to inline edit titles
- **Archive Items**: Soft-delete to archive section
- **Delete Items**: Permanent deletion with confirmation
- **Restore Items**: Recover from archive
- **Drag & Drop**: Reorder within parent or move between parents
- **Collapse/Expand**: Toggle visibility of nested items

#### 3. UI/UX
- Color-coded badges for Epic/Story/Task types
- Smooth hover states and transitions
- Visual feedback for drag operations
- Corner accent borders (Japanese Retro style)
- Grid background pattern
- Responsive layout for mobile/tablet/desktop
- Empty state messaging

#### 4. Data Model
```typescript
interface Todo {
  id: string;              // Unique identifier
  title: string;           // Todo text
  type: 'epic' | 'story' | 'task';  // Hierarchical level
  completed: boolean;      // Done or not
  archived: boolean;       // Soft-deleted
  createdAt: number;       // Timestamp
  parentId: string | null; // Reference to parent
  order: number;           // Sorting order
}
```

### Testing Results

✅ **Compilation**: Builds without errors (Turbopack, Next.js 15)
✅ **Components**: All components render correctly
✅ **Interactions**: Full CRUD operations working
✅ **Drag-and-Drop**: Native HTML5 implementation functional
✅ **localStorage**: Data persists between sessions
✅ **Styling**: Japanese Retro theme applied consistently
✅ **Responsive**: Layout adapts to different screen sizes

### Browser Compatibility

Works in all modern browsers supporting:
- HTML5 Drag and Drop API
- localStorage
- ES6+ JavaScript
- CSS Flexbox/Grid

### Future Enhancement Opportunities

- **IndexedDB Migration**: Upgrade to IndexedDB for larger datasets
- **Search & Filter**: Add search and filtering capabilities
- **Keyboard Shortcuts**: Cmd/Ctrl+K to quick-add, etc.
- **Undo/Redo**: History management for power users
- **Sorting Options**: Sort by date, completed status, etc.
- **Labels/Tags**: Additional categorization system
- **Due Dates**: Add deadline tracking
- **Recurring Tasks**: Support for repeating todos
- **Sharing**: Export/import todo lists
- **Analytics**: Task completion metrics and insights

---

**Last Updated:** November 19, 2025
**Started:** November 19, 2025
**Status:** ✅ Complete and Ready for Use
