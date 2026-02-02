# Enhanced Upload Dialog UI Mockup

## Overview
This document describes the UI mockup for the enhanced upload flow in the Document Management System.

## Viewing the Mockup

To view the mockup, navigate to:
```
/mockup/enhanced-upload
```

Or use this direct URL in your browser:
```
http://localhost:5173/mockup/enhanced-upload
```

## What's Included

The mockup demonstrates the complete upload flow with the following features:

### 1. Upload Dialog
When a user clicks "Upload" from a main folder or sub-category (not a Document Type folder), they see:

- **File Selection Area**: Drag-and-drop or click to browse for files
- **Confidentiality Level Dropdown**:
  - Public
  - Confidential
  - Secret
  - Top Secret
- **Document Type Dropdown**: Filtered to show only types available in the current folder context
- **Informational Message**: Blue info box explaining that documents must be stored in Document Type folders
- **Target Path Display**: Shows the resolved path where the document will be stored

### 2. Confirmation Dialog
After successful upload:
- Success message with checkmark icon
- Display of the full path where the document was stored
- Two action buttons:
  - **Go to Folder**: Navigate to the document location
  - **OK**: Close the confirmation dialog

## Design Features

### Visual Hierarchy
The mockup includes suggestions for folder icon differentiation:

- **Navigation Folders** (Gray icon): Main folders and sub-categories above Document Type level
- **Document Type Folders** (Green/Emerald icon): Upload-enabled folders where documents can be stored

### User Flow
1. User navigates to a main folder or sub-category
2. User clicks "Upload" button
3. Enhanced upload dialog appears
4. User selects file, confidentiality level, and document type
5. System shows the resolved target path dynamically
6. User confirms upload
7. Success confirmation appears with navigation options

## Interactive Elements

The mockup page includes:
- Toggle buttons to switch between different dialog states
- Live demo of the upload dialog
- Live demo of the confirmation dialog
- Design notes explaining key features
- Visual hierarchy suggestions

## Key Constraints (Maintained)

This mockup:
- Does NOT change any existing design, layout, or colors
- Is an enhancement to Upload UX only
- Keeps the current Document Library and folder structure unchanged
- Is UI mockup only (no backend logic)
- Does not modify existing components

## Implementation Notes

When implementing this design:
1. Only show this dialog when upload is triggered from non-Document Type folders
2. Filter Document Types based on the current folder context
3. Dynamically update the target path as the user selects options
4. Validate that both confidentiality level and document type are selected before allowing upload
5. Provide clear visual feedback throughout the process
