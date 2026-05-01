# Screen Spec — My Tools

## Screen name
My Tools

## Purpose
Allow an authenticated non-admin or standard user view to manage tools they personally share.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Role | Neighbor/user |
| Data scope | Current user’s tools only |

## Viewport assumption
| Field | Value |
|---|---|
| Base | Mobile-first, 390px |
| Scroll | Tool list scrolls vertically behind fixed bottom nav |

## Layout description
| Region | Description |
|---|---|
| Top header | Brand logo/name left; avatar and chevron right |
| Page heading | “My Tools” title with short helper text |
| Primary action | Full-width green “Add a Tool” button |
| Tool list | Vertical list of owned tool cards |
| Bottom nav | Home, Search, My Tools; My Tools active |

## Components visible
| Component | Content |
|---|---|
| Title | My Tools |
| Helper text | Manage the tools you share with your neighbors. |
| Add button | Plus icon + “Add a Tool” |
| Tool cards | Image, name, description, Available pill, Edit button, Remove button |
| Example tools | DeWalt drill, miter saw, pressure washer, ladder, leaf blower |

## Interactions
| User action | Result |
|---|---|
| Tap Add a Tool | Opens Add a Tool choice modal |
| Tap Edit on a tool | Opens edit/add tool form prefilled for that tool |
| Tap Remove on a tool | Starts remove confirmation flow or marks tool removed after confirmation |
| Tap Home nav | Navigate to Home |
| Tap Search nav | Navigate to Search Tools |
| Tap My Tools nav | Stay on current screen |
| Tap avatar/chevron | Navigate directly to My Account |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| No tools | Show empty state with “Add your first tool” primary action |
| Tool image missing | Show neutral placeholder thumbnail |
| Long tool name | Wrap or truncate without overlapping action buttons |
| Long description | Clamp to short preview on card |
| Remove failure | Keep card visible and show non-destructive error |

## Notes for coding agent
- Keep edit/remove action buttons stacked on the right side of each card.
- Do not show removed tools on this user-only screen unless product later adds an explicit filter.
- Do not add lending status, messages, reservations, or ratings.
