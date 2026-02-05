# Folder Search UI Mockup

## Overview
This document describes the UI/UX design mockup for the "Search within a specific folder" feature for the Document Library / My Files screen.

## Viewing the Mockup
To view the interactive mockup, navigate to:
```
http://localhost:5173/mockup/folder-search
```

## Design Requirements

### Key Principles
- **No changes to existing layout, colors, typography, spacing, or components**
- **Reuses the current Search UI component exactly as-is**
- **UI/UX enhancement only (no backend logic implementation)**

## Feature States

### State A: Root Level (No Folder Scope)
**Behavior:**
- User is at the root level of My Files
- Only the standard search bar appears
- No folder scope indicator is shown
- Search operates globally across all files

**Visual:**
- Standard search bar with existing styling
- No additional UI elements

### State B: Inside Folder (With Folder Scope Indicator)
**Behavior:**
- User has navigated into one or more folders
- A folder scope indicator appears below the search bar
- Search is now scoped to the current folder and its subfolders
- User can reset to global search with one click

**Visual Elements:**
1. **Folder Scope Indicator Bar**
   - Background: Light blue (bg-blue-50)
   - Border: Blue (border-blue-200)
   - Rounded corners (rounded-lg)
   - Padding: px-4 py-2.5

2. **Breadcrumb Path**
   - Format: "Searching in: [Folder] > [Subfolder] > [Current Folder]"
   - Each breadcrumb segment is clickable
   - Uses ChevronRight icon between segments
   - Color scheme: blue tones (text-blue-700, text-blue-900)
   - Example: "HR > Employees > Certificates"

3. **Clear Scope Button**
   - Text: "Clear scope"
   - Icon: X (close icon)
   - Positioned on the right side of the indicator bar
   - Color: Blue (text-blue-700, hover:text-blue-900)
   - Resets search to global (root level)

### Empty State: No Results in Folder
**Behavior:**
- User searches within a folder but no results are found
- Shows helpful empty state message

**Visual:**
- Centered layout with search icon
- Heading: "No documents found in this folder"
- Subtext: "Try adjusting your search terms or filters, or search in a different folder."
- Action button: "Clear search and show all files in this folder"

## Design Specifications

### Colors
- **Indicator Background:** `bg-blue-50`
- **Indicator Border:** `border-blue-200`
- **Text (Primary):** `text-blue-900`
- **Text (Secondary):** `text-blue-700`
- **Icon Color:** `text-blue-600`
- **Hover States:** `hover:text-blue-900`

### Typography
- **"Searching in:" label:** font-medium, text-sm
- **Breadcrumb segments:** text-sm, regular weight
- **Current folder:** font-semibold, text-sm
- **Clear button:** font-medium, text-sm

### Spacing
- **Indicator Padding:** px-4 py-2.5
- **Icon Spacing:** w-4 h-4
- **Gap between elements:** gap-2 (8px)

### Interactive Elements
1. **Breadcrumb Segments**
   - Clickable to navigate to parent folders
   - Hover effect: underline

2. **Clear Scope Button**
   - Removes folder scope
   - Returns to global search (root level)
   - Visual feedback on hover

## User Flow

1. **Starting State**
   - User is at root level
   - Only search bar visible

2. **Navigate into Folder**
   - User clicks on a folder
   - Folder scope indicator appears below search bar
   - Shows breadcrumb path to current folder

3. **Search within Folder**
   - User types in search bar
   - Results filtered to current folder only
   - Indicator remains visible

4. **Navigate via Breadcrumbs**
   - User clicks on parent folder in breadcrumb
   - Navigates to that folder
   - Breadcrumb updates to show new path

5. **Clear Scope**
   - User clicks "Clear scope" button
   - Returns to root level
   - Indicator disappears
   - Search becomes global again

## Implementation Notes

### When to Show Indicator
- ✅ Show when `currentFolder !== null`
- ❌ Hide when `currentFolder === null` (root level)

### Breadcrumb Generation
- Build from `breadcrumbs` state array
- Format: breadcrumbs.map(folder => folder.name).join(' > ')
- Make each segment clickable using existing `navigateToBreadcrumb(index)` function

### Integration Points
- Appears below the existing search bar (after the search input row)
- Uses existing `currentFolder` and `breadcrumbs` state
- Uses existing `navigateToBreadcrumb()` function
- No changes to search filtering logic (mockup only)

## Accessibility

- All interactive elements are keyboard accessible
- Clear visual hierarchy
- Sufficient color contrast (WCAG AA compliant)
- Screen reader friendly with semantic HTML

## Responsive Design

- On mobile: Breadcrumb text may truncate with ellipsis
- Clear button always visible
- Maintains touch-friendly tap targets (min 44x44px)

## File Location
- Mockup Component: `/src/components/FolderSearchUI.mockup.tsx`
- Route: `/mockup/folder-search`

## Next Steps (Implementation Phase)
When ready to implement:
1. Add folder scope indicator to MyFiles.tsx
2. Update search filter logic to respect folder scope
3. Add click handlers for breadcrumb navigation
4. Add clear scope functionality
5. Update empty state conditionally
6. Add state management for folder scope
7. Test with various folder depths
8. Ensure mobile responsiveness
