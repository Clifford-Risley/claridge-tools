# Screen Spec — Edit Profile Modal

## Screen name
Edit Profile Modal

## Purpose
Allow an admin to edit a user profile and toggle admin access while preserving email as non-editable identity.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Acting role | Admin |
| Target | User profile |
| Presentation | Modal over account/admin context |

## Viewport assumption
| Field | Value |
|---|---|
| Base | Mobile-first adapted to wide modal screenshot; must still work at 390px |
| Presentation | Center modal over darkened background; vertical scroll allowed on small screens |

## Layout description
| Region | Description |
|---|---|
| Overlay | Darkened inactive background |
| Modal panel | Large rounded white card |
| Modal header | “Edit Profile” title left; X close right |
| Photo column | Large avatar and Change Photo button |
| Form column | Editable profile fields with icons |
| Admin access row | Full-width card with shield icon, copy, and toggle |
| Primary action | Full-width green Save Changes button |

## Components visible
| Component | Editable | Content |
|---|---:|---|
| Profile photo | Yes | Avatar + Change Photo button |
| Full Name | Yes | Mike Peterson |
| Email Address | No | mike.peterson@gmail.com; disabled/gray field |
| Phone Number | Yes | (610) 555-1234 |
| Home Address | Yes | 123 Claridge Drive |
| Neighbor Since | Yes | Dropdown set to 2026 |
| Admin Access | Yes | Toggle on/off |
| Save Changes | Action | Primary submit button |

## Interactions
| User action | Result |
|---|---|
| Tap X | Close modal; warn if unsaved changes exist |
| Tap Change Photo | Open photo picker/upload flow |
| Edit text fields | Update local form state |
| Tap Neighbor Since | Open year dropdown/select |
| Toggle Admin Access | Update local admin permission state |
| Tap Save Changes | Validate and persist changes; close modal on success |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| Invalid phone | Show inline validation or preserve freeform based on product rule |
| Empty required field | Prevent save and show field error |
| Email edit attempt | Field remains disabled; no cursor/input |
| Removing own admin access | Require confirmation or block if last admin |
| Save failure | Keep modal open and show retryable error |
| Small viewport | Stack photo and fields vertically while preserving all editable fields |

## Notes for coding agent
- Email must be visibly disabled and not editable.
- Admin Access row spans the bottom area and uses a clear toggle.
- This modal may be used for self-edit or admin-edit; permission rules must come from route/context.
