# CSS Unique Classes Documentation

## Overview
To prevent CSS conflicts between different dashboard components, each component now uses unique class prefixes for modal and form elements.

## Component Class Prefixes

### 1. PhotoEditRequests Component (User Dashboard)
**File**: `src/components/PhotoEditRequests.css`
**Prefix**: `photo-edit-`

**Modal Classes**:
- `.photo-edit-modal-overlay`
- `.photo-edit-modal`
- `.photo-edit-details-modal`
- `.photo-edit-create-modal`
- `.photo-edit-modal-header`
- `.photo-edit-modal-content`
- `.photo-edit-modal-form`
- `.photo-edit-modal-actions`
- `.photo-edit-close-btn`

### 2. AdminDashboard Component
**File**: `src/styles/AdminDashboard.css`
**Prefix**: `admin-`

**Modal Classes**:
- `.admin-modal-overlay`
- `.admin-modal`
- `.admin-modal-header`
- `.admin-close-button`
- `.admin-form-group`
- `.admin-form-actions`
- `.admin-cancel-button`

### 3. PhotographerDashboard Component
**File**: `src/styles/PhotographerDashboard.css`
**Prefix**: `photographer-`

**Modal Classes**:
- `.photographer-modal-overlay`
- `.photographer-modal`
- `.photographer-modal-header`
- `.photographer-modal-form`
- `.photographer-modal-actions`
- `.photographer-close-btn`

### 4. PhotographerPhotoEditRequests Component
**File**: `src/components/PhotographerPhotoEditRequests.css`
**Prefix**: `photographer-photo-edit-`

**Modal Classes**:
- `.photographer-photo-edit-modal-overlay`
- `.photographer-photo-edit-modal`
- `.photographer-photo-edit-details-modal`
- `.photographer-photo-edit-upload-modal`
- `.photographer-photo-edit-modal-header`
- `.photographer-photo-edit-modal-content`
- `.photographer-photo-edit-modal-form`
- `.photographer-photo-edit-modal-actions`
- `.photographer-photo-edit-close-btn`

## Usage Notes

1. **User Dashboard**: Uses `photo-edit-` prefix for all photo editing related modals
2. **Admin Dashboard**: Uses `admin-` prefix for all admin specific modals
3. **Photographer Dashboard**: Uses `photographer-` prefix for general photographer modals
4. **Photographer Photo Edit**: Uses `photographer-photo-edit-` prefix for photo editing specific modals

## Benefits

- **No CSS Conflicts**: Each component has unique class names
- **Clear Naming**: Easy to identify which component styles belong to
- **Maintainable**: Changes to one component won't affect others
- **Scalable**: Easy pattern to follow for future components

## Important Notes

- All JSX components must be updated to use the new unique class names
- Original generic classes (`.modal`, `.modal-overlay`, etc.) should be avoided
- When adding new modal components, follow the prefix pattern established here
