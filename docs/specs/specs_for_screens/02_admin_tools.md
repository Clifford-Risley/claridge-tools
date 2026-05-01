# Screen Spec — Admin Tools

## Screen name
Admin Tools

## Purpose
Allow admins to view and manage all tools across users, including removed tools.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Role | Admin |
| Data scope | All community tools |

## Viewport assumption
| Field | Value |
|---|---|
| Base | Mobile-first, 390px |
| Scroll | Tool list scrolls vertically behind fixed bottom nav |

## Layout description
| Region | Description |
|---|---|
| Top header | Brand logo/name left; avatar and chevron right |
| Page heading | “Admin Tools” plus Admin Mode badge |
| Page helper | Explains all-tool management including removed tools |
| Primary action | Full-width green “Add a Tool” button |
| Filter row | Segmented pills for All Tools, Available, Removed with counts |
| Tool list | Vertical cards showing available and removed states |
| Bottom nav | Home, Search, My Tools, Admin; My Tools active in this screenshot |

## Components visible
| Component | Content |
|---|---|
| Admin badge | Shield icon + “Admin Mode” |
| Filter pills | All Tools 12; Available 9; Removed 3 |
| Available tool card | Image, name, description, Available pill, Edit, Remove |
| Removed tool card | Dimmed text/image, Removed pill, removal date, Restore button |

## Interactions
| User action | Result |
|---|---|
| Tap Add a Tool | Opens Add a Tool choice modal or admin add flow |
| Tap filter pill | Updates list to selected filter |
| Tap Edit | Opens tool edit form |
| Tap Remove | Starts remove confirmation flow |
| Tap Restore | Restores removed tool to available state after confirmation or immediate success |
| Tap Admin nav | Navigate to Admin dashboard |
| Tap Home/Search/My Tools nav | Navigate to corresponding screen |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| No tools for filter | Show filter-specific empty message |
| Removed date missing | Show “Removed” without date; do not fabricate date |
| Counts loading | Show neutral loading state or omit counts until known |
| Restore failure | Keep card removed and show error |
| Unauthorized role | Redirect or hide this screen from non-admin users |

## Notes for coding agent
- Admin mode should be visually obvious but not visually noisy.
- Removed tools use gray/desaturated styling and only expose Restore, not Edit/Remove.
- Counts must match the active dataset.
