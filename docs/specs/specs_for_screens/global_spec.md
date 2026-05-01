# Global Spec — Claridge Tools

## Product scope
| Area | Requirement |
|---|---|
| Product type | Neighborhood tool-sharing web app |
| Core behavior | Users browse tools, manage their own tools, and admins manage users/tools |
| Excluded behavior | No in-app messaging, scheduling, payments, ratings, reviews, or borrowing workflow |
| Trust model | Identity and contact/account information are emphasized over transactional features |

## Viewport assumption
| Item | Requirement |
|---|---|
| Primary target | Mobile-first |
| Base width | 390px |
| Safe areas | Respect iOS status bar and bottom home indicator |
| Content behavior | Vertical scroll when content exceeds viewport |
| Desktop/tablet | Center mobile layout or adapt with same hierarchy; do not add new features |

## Navigation pattern
| Nav item | Visible to | Destination |
|---|---|---|
| Home | All authenticated users | Home landing screen |
| Search | All authenticated users | Search/browse tools screen |
| My Tools | All authenticated users | User-owned tools management screen |
| Admin | Admin users only | Admin dashboard screen |

## Shared header pattern
| Element | Requirement |
|---|---|
| Status bar | Time left; system indicators right |
| Brand row | Flamingo holding a tool logo left; “Claridge Tools” text in green |
| Profile control | Circular user avatar at top-right with down-chevron; tapping either navigates directly to My Account |
| Header behavior | Present on main screens; back arrow appears on task/detail flows |

## Shared visual language
| Pattern | Requirement |
|---|---|
| Background | Clean white/off-white |
| Primary color | Deep green for brand, primary actions, active nav, positive status |
| Secondary text | Muted blue-gray |
| Destructive color | Red for remove/delete actions |
| Disabled/removed state | Light gray text, gray status pills, reduced visual emphasis |
| Cards | White rounded rectangles, thin light border, soft shadow |
| Inputs | Rounded white fields with light gray border; placeholder muted gray |
| Buttons | Rounded rectangles; primary buttons filled green with white text |
| Icons | Thin-line style; green when active/positive, gray/navy when inactive, red for destructive |

## Typography pattern
| Usage | Requirement |
|---|---|
| App title | Large bold green |
| Screen title | Large bold near-black |
| Section title | Bold near-black |
| Card title | Semibold/bold near-black |
| Body text | Regular muted blue-gray |
| Labels | Small semibold near-black or muted blue-gray |
| Status text | Small semibold, color-coded |

## Spacing conventions
| Area | Requirement |
|---|---|
| Page padding | Consistent horizontal padding, approximately 20–24px at 390px base |
| Vertical rhythm | Clear gaps between header, title, actions, cards, and bottom nav |
| Cards | Internal padding sufficient for touch targets and readability |
| Lists | Cards separated by visible vertical spacing; avoid dense table-like layout |
| Bottom nav | Fixed at bottom; content should not be hidden behind it |

## Shared components
| Component | Behavior |
|---|---|
| Tool card | Shows image, tool name, description, status/owner, and allowed actions |
| User avatar | Circular image; may appear in header, cards, and user search results |
| Status pill | Small rounded badge for Available, Removed, Admin, Neighbor, counts |
| Primary CTA | Full-width green button for major actions |
| Icon action button | Bordered rounded button with icon and label |
| Modal | Centered rounded panel over darkened background overlay |
| Form field | Label above input; supports disabled state and dropdown state |

## Cross-screen implementation constraints
| Constraint | Requirement |
|---|---|
| Admin visibility | Admin nav and admin controls must only render for admin users |
| User profile menu | Avatar/chevron is a direct link to My Account; no intermediate menu |
| Removed tools | Non-admin users should not see removed tools in browse results |
| Tool ownership | My Tools shows only current user’s tools unless admin mode is active |
| Contact model | Do not add chat, booking, payment, reviews, or availability calendar |
| Accessibility | All tappable controls must have clear labels and minimum touch target size |
