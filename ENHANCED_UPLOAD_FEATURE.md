# Enhanced Upload Feature

## Overview
The Enhanced Upload feature has been integrated into the My Files section. When users upload files from department folders (non-Document Type folders), they are presented with an enhanced dialog that guides them through proper document classification.

## User Flow

### When Upload is Triggered
1. User navigates to any department folder (not a Document Type folder)
2. User clicks "Upload File" button
3. User selects a file from their computer
4. Enhanced Upload Dialog appears

### Enhanced Upload Dialog
The dialog displays:

1. **File Information**: Shows the selected file name
2. **Confidentiality Level Dropdown** (Required):
   - Public
   - Internal
   - Confidential
   - Restricted
   - Secret
   - Top Secret

3. **Document Type Dropdown** (Required):
   - Automatically filtered to show only document types available in the current department
   - Examples include:
     - Payroll Record or Card
     - Personal Identification Documents
     - Service Termination Resolution
     - Translations
     - General Outgoing Records for the Administrative Entity
     - Property Ownership Documents
     - Agreements and Treaties
     - File Copy
     - Budget Support Correspondence
     - And more...

4. **Information Banner**:
   - Blue alert box explaining that documents must be stored in Document Type folders
   - System will automatically handle proper storage location

5. **Dynamic Path Display**:
   - Shows the resolved target path where the document will be stored
   - Updates dynamically as the user selects a document type
   - Example: HR > Category-1 > Sub-category-1 > Payroll Record or Card

### After Upload
- Success toast message appears
- Document is stored with the selected confidentiality level
- Document is linked to the selected document type
- File appears in the file list

## Technical Implementation

### Components
- **EnhancedUploadDialog.tsx**: The main dialog component
  - Fetches document types from Supabase
  - Filters document types by current department
  - Displays breadcrumb path
  - Handles user input validation

- **MyFiles.tsx**: Updated to integrate the new dialog
  - Detects if upload is from a leaf folder (Document Type) or not
  - Shows EnhancedUploadDialog for non-leaf folders
  - Shows NCARMetadataModal for leaf folders (existing behavior)

### Database
- Document types are stored in the `document_types` table
- Files reference document types via `document_type_id` field
- Document types are department-specific

### Key Features
1. **Context-Aware**: Only shows document types relevant to the current department
2. **User-Friendly**: Clear visual feedback with breadcrumb path
3. **Validation**: Requires both confidentiality level and document type
4. **Informative**: Explains where the document will be stored

## Document Types Available
The system includes the following document types (matching NCAR standards):

- **HR Documents**:
  - Payroll Record or Card
  - Personal Identification Documents
  - Service Termination Resolution

- **Legal Documents**:
  - Property Ownership Documents
  - Agreements and Treaties
  - Contract

- **Financial Documents**:
  - Financial Record
  - Budget Support Correspondence

- **General/Administrative**:
  - Translations
  - General Outgoing Records for the Administrative Entity
  - File Copy
  - Standard Document
  - Permanent Record

## Future Enhancements
Potential improvements for this feature:
1. Add folder hierarchy selection within the dialog
2. Implement document type filtering based on folder context
3. Add document metadata fields specific to each document type
4. Include retention policy information in the dialog
5. Support for bulk upload with document type assignment
