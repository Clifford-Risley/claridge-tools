# Screen Spec — My Account / Admin User

## Screen name
My Account — Admin User

## Purpose
Show the signed-in admin’s profile, community/support/legal links, and admin role status.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Role | Admin |
| Data scope | Current user account |

## Viewport assumption
| Field | Value |
|---|---|
| Base | Mobile-first, 390px |
| Scroll | Account sections scroll behind fixed bottom nav |

## Layout description
| Region | Description |
|---|---|
| Top header | Brand logo/name left; avatar and chevron right |
| Page heading | “My Account” |
| Profile card | Large avatar left; identity details right; Edit Profile button under avatar |
| Section cards | Community, Support, Legal |
| Footer note | Heart icon and neighbor appreciation text |
| Bottom nav | Home, Search, My Tools, Admin; Admin active |

## Components visible
| Component | Content |
|---|---|
| Profile identity | Mike Peterson; Admin badge; email; phone; address; Neighbor since 2026 |
| Edit Profile button | Pencil icon + “Edit Profile” |
| Community links | Community Guidelines; Report a User |
| Support links | Send Feedback; Something Not Working? |
| Legal links | Terms of Service; Privacy Policy |
| Footer text | Thanks for being a great neighbor. |

## Interactions
| User action | Result |
|---|---|
| Tap Edit Profile | Opens Edit Profile modal |
| Tap Community Guidelines | Navigate to guidelines page |
| Tap Report a User | Navigate/open report user flow |
| Tap Send Feedback | Navigate/open feedback flow |
| Tap Something Not Working? | Navigate/open support issue flow |
| Tap Terms of Service | Navigate to terms page |
| Tap Privacy Policy | Navigate to privacy page |
| Tap Admin nav | Stay on admin/account route if active or navigate to admin dashboard depending app IA |
| Tap avatar/chevron | Navigate directly to My Account |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| Missing phone/address | Show omitted field or “Not provided” based on account policy |
| Non-admin user | Do not show Admin badge or Admin nav |
| Profile photo missing | Show neutral avatar/initials |

## Notes for coding agent
- Admin label should be prominent in profile card.
- Email is displayed as identity/contact information; editing rules are handled in Edit Profile modal.
- Keep support/legal/community as simple navigation rows.
