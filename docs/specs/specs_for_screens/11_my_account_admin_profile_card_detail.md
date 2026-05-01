# Screen Spec — My Account Admin Profile Card Detail

## Screen name
My Account — Admin Profile Card Detail

## Purpose
Capture the enlarged admin profile card pattern used within the My Account screen.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Role | Admin |
| Data scope | Current user profile summary |

## Viewport assumption
| Field | Value |
|---|---|
| Base | Mobile-first, 390px |
| Context | Cropped/zoomed reference of the profile card region |

## Layout description
| Region | Description |
|---|---|
| Card container | White rounded card with soft shadow |
| Left column | Large circular avatar with Edit Profile button beneath |
| Right column | Name, admin badge, and contact/account details stacked vertically |

## Components visible
| Component | Content |
|---|---|
| Avatar | Large user profile photo |
| Name | Mike Peterson |
| Role badge | Green star-in-circle icon + Admin |
| Email row | Envelope icon + mike.peterson@gmail.com |
| Phone row | Phone icon + (610) 555-1234 |
| Address row | House icon + 123 Claridge Drive |
| Neighbor row | Shield/house icon + Neighbor since 2026 |
| Edit Profile button | Pencil icon + Edit Profile |

## Interactions
| User action | Result |
|---|---|
| Tap Edit Profile | Opens Edit Profile modal |
| Tap avatar | No required action unless tied to profile photo edit via Edit Profile |
| Tap contact rows | No required action; display-only in this pattern |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| Non-admin user | Hide Admin badge and icon; preserve spacing cleanly |
| Missing contact field | Omit row or show “Not provided” based on account policy |
| Long email/address | Wrap or truncate without leaving card bounds |
| Missing avatar | Use initials/placeholder |

## Notes for coding agent
- This is not a standalone route unless the app chooses to implement it as one.
- Use it as the canonical profile summary layout for account screens.
- Preserve large avatar + editable button emphasis.
