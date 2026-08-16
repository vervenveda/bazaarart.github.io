# Beta Index Coverage

- Added in this run: **1**
- Already covered: **45**
- Skipped: **0**

Rule: visible HTML filenames ending in `index.html` (including `_index.html` and common `inndex.html` typos) receive `/assets/vnv-beta-link.js`. Legacy markup without a closing `body` falls back before `html` or safely at EOF. The widget reports only public hostname + pathname; never learner/family IDs, answers, form values, query/hash, storage, or credentials.

## Added

- `apps/composition/vivoser-composer_index.html`
