# Screen Spec — Add a Tool Choice Modal

## Screen name
Add a Tool Choice Modal

## Purpose
Let a user choose between manual tool entry and photo-assisted tool entry.

## User state
| Field | Value |
|---|---|
| Auth | Signed in |
| Role | Neighbor or admin |
| Invocation | From Add a Tool button |

## Viewport assumption
| Field | Value |
|---|---|
| Base | Mobile-first, 390px |
| Presentation | Center modal over dimmed current screen |

## Layout description
| Region | Description |
|---|---|
| Background | Current screen remains visible but darkened and inactive |
| Modal panel | Centered rounded white card |
| Modal header | Title centered; close X top-right |
| Prompt | Short question under title |
| Option cards | Two large tappable cards separated by OR divider |

## Components visible
| Component | Content |
|---|---|
| Title | Add a Tool |
| Prompt | How would you like to add your tool? |
| Manual option | Pencil icon, “Enter Details Manually”, helper text, chevron |
| Divider | Horizontal lines with OR centered |
| Photo option | Camera icon, “Upload a Photo”, helper text, chevron |
| Close | X icon |

## Interactions
| User action | Result |
|---|---|
| Tap Enter Details Manually | Navigate to Add a Tool form with blank fields |
| Tap Upload a Photo | Start photo picker/camera permission flow, then navigate to Add a Tool form with image and inferred fields when available |
| Tap X | Dismiss modal and return to previous screen |
| Tap outside modal | Dismiss only if app standard allows; otherwise no-op |

## Edge cases / empty states
| Case | Requirement |
|---|---|
| Camera/photo permission denied | Show permission guidance and allow manual entry fallback |
| Photo upload fails | Show error and allow retry or manual entry |
| AI/inference unavailable | Continue with uploaded image and empty editable fields |

## Notes for coding agent
- Background controls must not be interactive while modal is open.
- Keep choices limited to the two shown options.
- Do not add category, scheduling, or availability setup in this modal.
