# Screen Spec — Add a Tool Form

## Screen name
Add a Tool Form

## Purpose
Allow a user to create or edit a tool listing with image, name, and description.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Role | Neighbor or admin |
| Mode | Add new tool or edit existing tool |

## Viewport assumption
| Field | Value |
|---|---|
| Base | Mobile-first, 390px |
| Scroll | Form may scroll; save button remains near lower content area or sticky if needed |

## Layout description
| Region | Description |
|---|---|
| Top header | Brand logo/name left; avatar and chevron right |
| Flow header | Back arrow, “Add a Tool” title, helper text |
| Image area | Large rounded tool image preview |
| Form fields | Tool Name input and Description textarea |
| Primary action | Full-width green Save Tool button |
| Bottom nav | Home, Search, My Tools; My Tools active |

## Components visible
| Component | Content |
|---|---|
| Back control | Left arrow |
| Title | Add a Tool |
| Helper text | Add some basic details about your tool. |
| Image preview | Tool photo |
| Tool Name field | Example: DeWalt 20V Cordless Drill |
| Description field | Example description; character count 52/300 |
| Save button | Save Tool |

## Interactions
| User action | Result |
|---|---|
| Tap back arrow | Return to prior screen/modal state; warn if unsaved changes exist |
| Edit Tool Name | Updates local form state |
| Edit Description | Updates local form state and character count |
| Tap image | Change/upload photo if supported |
| Tap Save Tool | Validate fields; save listing; return to My Tools on success |
| Tap bottom nav | Navigate only after unsaved-change handling |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| Empty name | Prevent save and show field error |
| Empty description | Allow or require based on product rule; if required, show field error |
| Description over 300 | Prevent save or block additional characters |
| Missing image | Show placeholder and allow save if product permits |
| Save failure | Keep user on form and show retryable error |

## Notes for coding agent
- Keep form intentionally minimal: image, name, description only.
- Do not add category, availability calendar, condition, location, price, or scheduling fields unless separately requested.
- Same screen can support edit mode by changing title/action copy and prefilled data.
