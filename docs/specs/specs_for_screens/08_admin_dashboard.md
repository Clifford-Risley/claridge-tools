# Screen Spec — Admin Dashboard

## Screen name
Admin Dashboard

## Purpose
Provide admin entry points for managing authorized users and all tools.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Role | Admin |
| Data scope | Community-wide admin controls |

## Viewport assumption
| Field | Value |
|---|---|
| Base | Mobile-first, 390px |
| Scroll | Sections scroll vertically behind fixed bottom nav |

## Layout description
| Region | Description |
|---|---|
| Top header | Brand logo/name left; avatar and chevron right |
| Page heading | “Admin” plus Admin Mode badge |
| Helper text | Manage users and tools across the community |
| Manage Users card | Contains trusted email add form and user search form |
| Manage Tools card | Entry point to admin tool list |
| Admin Access info card | Confirms full access |
| Bottom nav | Home, Search, My Tools, Admin; Admin active |

## Components visible
| Component | Content |
|---|---|
| Admin badge | Shield icon + “Admin Mode” |
| Add Trusted Email | Email icon, title, helper text, email input, Add button |
| Manage Users | Search icon, title, helper text, email search input |
| Manage Tools | Toolbox icon, title, helper text, View Tools row with chevron |
| Admin Access | Shield icon, title, access description |

## Interactions
| User action | Result |
|---|---|
| Enter trusted email | Updates input value |
| Tap Add | Validates email and adds to trusted/authorized list |
| Enter user search | Searches users by email/name |
| Tap View Tools | Navigate to Admin Tools screen |
| Tap bottom nav | Navigate to selected tab |
| Tap avatar/chevron | Navigate directly to My Account |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| Invalid email | Show inline validation error and do not submit |
| Duplicate trusted email | Show duplicate message; do not create duplicate entry |
| Add failure | Show retryable error near Add Trusted Email card |
| User search no results | Show “No users found” below search input |
| Non-admin access | Deny route or redirect away |

## Notes for coding agent
- Keep Admin dashboard as a control hub, not a data-heavy screen.
- Do not expose destructive user actions directly on this base state.
- User management search results are specified separately.
