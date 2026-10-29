# Bazaar Art Live — staging migration

Read-only production preservation: source remains in `333.github.io/app/Bazaar_Art_Live_index.html`.

This branch stages a standalone copy in `live/index.html` with explicit 333 Network paths for HOLLO, KANSEE, E=Ven, SIte, Bunya, and gateway, preserving the current localStorage and IndexedDB keys. **Do not merge or redirect production yet.**

Source snapshot SHA: f6016995cb99656831d81132173372d6787a70de

## Mandatory parity gates
1. Confirm source snapshot matches production functionality.
2. Test same-origin HOLLO enrollment handoff and storage-event refresh.
3. Export workspace including media; import into a disposable browser profile; verify post/media parity and recovery on failed import.
4. Test mobile and desktop navigation, search, posts, comments, reactions, groups, events, stories, reels.
5. Test online/offline behavior and 333 service worker scope/cache.
6. Verify all absolute paths under vervenveda.com and no 404s.
7. Review backend integration separately; this frontend is local-first, not an authenticated shared feed.
8. Preserve original 333 entry point until verified migration and explicit cutover approval.

## Known deferred repairs
- Transactional workspace import (current import clears media before replacement).
- Consolidation of duplicate storage event handlers.
- Dedicated Bazaar PWA/manifest and offline cache strategy.
- Formal STOS/OHMIC identity and data adapter.

## Staging repair receipts
- Workspace import validates the payload and uses an atomic IndexedDB media replacement transaction; full crash-safe cross-store recovery remains unverified.
- Cross-tab storage handlers consolidated into one listener, preserving HOLLO handoff and counting new posts by ID.
- Source review passed for both changes; browser-based integration tests are still required.
- The 333 production app, Bazaar homepage, and STOS terminal were not changed.
