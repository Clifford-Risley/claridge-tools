# Screen Spec — My Account / Neighbor User

## Screen name
My Account — Neighbor User

## Purpose
Show a signed-in neighbor’s profile and simple account support/community/legal navigation.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Role | Neighbor/user |
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
| Profile card | Avatar left; details right; Edit Profile button under avatar |
| Section cards | Community, Support, Legal |
| Footer note | Heart icon and neighbor appreciation text |
| Bottom nav | Home, Search, My Tools; My Tools active in screenshot |

## Components visible
| Component | Content |
|---|---|
| Profile identity | Mike Peterson; email; phone; address; Neighbor since 2026 |
| Edit Profile button | Pencil icon + “Edit Profile” |
| Community links | Community Guidelines; Report a User |
| Support links | Send Feedback; Something Not Working? |
| Legal links | Terms of Service; Privacy Policy |
| Footer text | Thanks for being a great neighbor. |

## Interactions
| User action | Result |
|---|---|
| Tap Edit Profile | Opens Edit Profile modal without admin access controls for non-admin users |
| Tap Community Guidelines | Navigate to guidelines page |
| Tap Report a User | Navigate/open report user flow |
| Tap Send Feedback | Navigate/open feedback flow |
| Tap Something Not Working? | Navigate/open support issue flow |
| Tap Terms of Service | Navigate to terms page |
| Tap Privacy Policy | Navigate to privacy page |
| Tap bottom nav | Navigate to selected tab |
| Tap avatar/chevron | Navigate directly to My Account |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| Missing phone/address | Show omitted field or “Not provided” based on account policy |
| Profile photo missing | Show initials or neutral avatar |
| User becomes admin | Add Admin nav and admin badge in profile |

## Notes for coding agent
- Do not show Admin nav or Admin badge for standard users.
- Account links are simple navigational rows with chevrons.
- Keep the profile card compact enough to leave room for account sections.
