# Screen Spec — Home Landing

## Screen name
Home Landing

## Purpose
Provide a bare-bones entry point for the two primary user actions: find tools and manage owned tools.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Role | Neighbor or admin |
| Personalization | First name displayed |

## Viewport assumption
| Field | Value |
|---|---|
| Base | Mobile-first, 390px |
| Scroll | Usually no scroll; content should fit on screen |

## Layout description
| Region | Description |
|---|---|
| Top header | Brand logo/name left; avatar and chevron right |
| Greeting | Large “Hi [First name]” |
| Primary tiles | Two large centered action cards stacked vertically |
| Bottom nav | Home, Search, My Tools, Admin if user is admin; Home active |

## Components visible
| Component | Content |
|---|---|
| Greeting | Hi Anna |
| Search Tools tile | Large search icon, title, helper text |
| Manage My Tools tile | Large toolbox icon, title, helper text |
| Bottom nav | Home, Search, My Tools, Admin |

## Interactions
| User action | Result |
|---|---|
| Tap Search Tools tile | Navigate to Search Tools screen |
| Tap Manage My Tools tile | Navigate to My Tools screen |
| Tap Home nav | Stay on Home |
| Tap Search nav | Navigate to Search Tools |
| Tap My Tools nav | Navigate to My Tools |
| Tap Admin nav | Navigate to Admin dashboard; visible only to admins |
| Tap avatar/chevron | Navigate directly to My Account |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| Missing first name | Use generic “Hi” or fallback display name |
| Non-admin user | Hide Admin nav and distribute remaining nav items evenly |
| Long first name | Keep greeting readable; wrap if needed |

## Notes for coding agent
- This screen should remain intentionally sparse.
- Do not add search bar, feed, recent activity, notifications, or recommendations.
