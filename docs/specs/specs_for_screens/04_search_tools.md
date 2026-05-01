# Screen Spec — Search Tools

## Screen name
Search Tools

## Purpose
Allow users to browse and search tools shared by neighbors.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Role | Neighbor or admin |
| Data scope | Available community tools |

## Viewport assumption
| Field | Value |
|---|---|
| Base | Mobile-first, 390px |
| Scroll | Results list scrolls vertically behind fixed bottom nav |

## Layout description
| Region | Description |
|---|---|
| Top header | Brand logo/name left; avatar and chevron right |
| Search row | Search input left; Filters button right |
| Category row | Horizontally arranged category chips |
| Results heading | “Tools nearby” with result count |
| Results list | Tool cards with image, description, owner, bookmark action |
| Bottom nav | Home, Search, My Tools; Home active in screenshot, but screen represents browse/search experience |

## Components visible
| Component | Content |
|---|---|
| Search input | Placeholder “Search tools...” |
| Filters button | Sliders icon + “Filters” |
| Category chips | Power Tools, Ladders, Yard Work, Cleaning, More |
| Result count | 24 results |
| Tool card | Tool image, name, description, owner avatar/name, bookmark icon |

## Interactions
| User action | Result |
|---|---|
| Type in search input | Filter results by tool name/description/category |
| Tap Filters | Open filters panel/modal |
| Tap category chip | Apply category filter and update results |
| Tap More | Show additional categories |
| Tap tool card | Open tool detail/contact view if implemented |
| Tap bookmark | Save/unsave tool locally for user |
| Tap owner avatar/name | Open public neighbor profile if implemented |
| Tap bottom nav | Navigate to selected tab |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| No results | Show friendly empty result state and clear-filter action |
| Search loading | Show lightweight loading state without blocking input |
| Missing owner avatar | Show initials or neutral avatar |
| Missing image | Show tool placeholder |
| Removed tool | Do not show in standard search results |

## Notes for coding agent
- Search is discovery-only; do not add chat, reserve, checkout, or payment actions.
- Bookmark is allowed as a passive save action; it must not imply borrowing.
- The active nav should reflect actual route when implemented.
