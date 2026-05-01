# Screen Spec — Admin Dashboard With User Search Results

## Screen name
Admin Dashboard — User Search Results

## Purpose
Show admin search results for matching users and allow selection of a user to manage.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Role | Admin |
| Query state | Search query entered: “Smith” |

## Viewport assumption
| Field | Value |
|---|---|
| Base | Mobile-first, 390px |
| Scroll | Page scrolls vertically behind fixed bottom nav |

## Layout description
| Region | Description |
|---|---|
| Header and admin intro | Same as Admin Dashboard |
| Manage Users card | Add Trusted Email plus populated Manage Users search state |
| Results list | User cards shown under search input |
| Remaining sections | Manage Tools and Admin Access remain below |
| Bottom nav | Home, Search, My Tools, Admin; Admin active |

## Components visible
| Component | Content |
|---|---|
| Search input | Query text “Smith” and clear X icon |
| Result count | 3 users found |
| User result row | Avatar, full name, email, role badge, chevron |
| Results shown | Anna Smith admin; David Smith neighbor; Jennifer Smith neighbor |
| Role badges | Green Admin badge; gray Neighbor badges |

## Interactions
| User action | Result |
|---|---|
| Type in search input | Updates results live or after debounce |
| Tap clear X | Clears query and hides results |
| Tap user row | Open selected user profile/admin edit view |
| Tap Add Trusted Email Add button | Same behavior as base Admin Dashboard |
| Tap View Tools | Navigate to Admin Tools screen |
| Tap bottom nav | Navigate to selected tab |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| No users found | Show “No users found” below input |
| Many users found | Limit visible list or paginate/scroll inside card; avoid pushing critical sections indefinitely |
| Search loading | Show subtle loading indicator in results area |
| Duplicate names | Email must remain visible to disambiguate |
| Current admin in results | Allow selection unless product blocks self-management for safety |

## Notes for coding agent
- Search results should preserve the same card styling as the dashboard.
- The result row chevron indicates drill-in; do not expose delete/remove directly in the list.
- Use role badge colors consistently with account/admin screens.
