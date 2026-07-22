# Bazaar Art Zone

**Bazaar Art Zone** is the public GitHub Pages home for **Bazaar Art LLC**, a creative community and event organization established in February 2017.

This repository is designed as a warm, public-facing landing page for artists, poets, musicians, patrons of the arts, community members, and curious visitors who want to explore the Bazaar Art creative ecosystem.

## About Bazaar Art LLC

Bazaar Art LLC was established in February 2017 and has grown into a lively center for creativity and community involvement. Over the years, Bazaar Art has organized and supported community events, immersive art exhibitions, artist showcases, collaborative workshops, and interactive gatherings.

Each event and creative space is intended to:

- Celebrate local and emerging talent
- Encourage artistic conversation
- Foster meaningful connection between artists and audiences
- Welcome diverse voices across mediums, backgrounds, and experience levels
- Support cultural exchange, creativity, and community belonging

## Welcome to the Bazaar Art Zone

Bazaar Art Zone is more than a gallery.

It is a living, breathing creative gathering place for:

- Artists
- Poets
- Musicians
- Makers
- Patrons of the arts
- Students and lifelong learners
- Community members
- Curious observers

Visitors are invited to share work, cheer others on, discover inspiration, and participate in a welcoming creative community.

## Repository Purpose

This repository holds the public landing page for:

**bazaarart.github.io**

The landing page includes:

- A Bazaar Art Zone welcome section
- Bazaar Art LLC community story
- Creative spaces and app cards
- Gallery, workshop, event, and opportunity sections
- Breadcrumb navigation back to Verve N Veda
- A categorized Verve N Veda ecosystem directory
- A minimal searchable hamburger menu
- Public links to connected repositories and domains

## Connected Ecosystem Links

This landing page connects Bazaar Art Zone with the broader Verve N Veda network, including:

- Verve N Veda
- Bazaar Art
- My Art Gallery
- Creche Preschool
- KinderGarden
- Khaemenes Academy
- Khaemenes Elementary
- Khaemenes Jr High
- Khaemenes High
- Khaemenes University
- ARSHIF Archives
- The Verifier
- PLERA Search
- Arcade
- Aurora
- Linguistics
- Solanar
- River to Road
- Firmament Law
- Professional Resource Hub
- Administration
- One Nation for All
- Jennifer Pearl 2028
- MyArtGallery.online

## Design Principles

Bazaar Art Zone is built to feel:

- Creative
- Welcoming
- Community-centered
- Elegant
- Warm
- Accessible
- Easy to navigate
- Public-facing
- Mobile-friendly

The design uses soft artistic colors, warm ivory backgrounds, botanical-style ornament, rounded cards, and a clean categorized menu structure.

## Technical Approach

This repository is intentionally simple and portable.

The page is built as a single static HTML file using:

- HTML
- CSS
- Vanilla JavaScript

There are no required build tools, package managers, frameworks, external scripts, analytics, ads, or tracking systems.

## Privacy and User Respect

Bazaar Art Zone is designed as a public resource and creative community doorway.

The landing page does not require:

- Ads
- Trackers
- Cookies
- Analytics
- User accounts
- External software dependencies

Any future interactive tools should preserve the same privacy-respecting approach wherever possible.

## Editing the Landing Page

Most links and cards are managed from JavaScript arrays near the bottom of the `index.html` file.

To add or edit a page:

1. Open `index.html`.
2. Find the relevant registry section.
3. Add or update the title, category, URL, and description.
4. Save the file.
5. Commit and push the change to GitHub.

The directory cards and menu will update from the same list.

## Suggested File Structure

```text
bazaarart.github.io/
├── index.html
├── README.md
├── LICENSE.md
└── assets/

The current page can run with only index.html, but the additional files help document the project and protect the work.

Suggested Future Sections

Future Bazaar Art Zone pages may include:

Artist Showcase
Workshop Studio
Community Chatroom
Calls for Art
Creative Tools
Event Archive
Gallery Directory
Poetry Corner
Musician Showcase
Youth Art Gallery
Art Business Resources
Portfolio Builder
Local Event Calendar
Community Exhibition Pages
Ownership

Bazaar Art Zone is owned and developed by Bazaar Art LLC.

Founder / Owner: Jennifer Kay Pearl

Public Statement

Bazaar Art Zone exists to help creativity find community.

It is a space for sharing, encouragement, artistic exploration, public connection, and meaningful cultural participation.

Share your work. Cheer others on. Soak in the creative energy. It all starts here.
"""

path = Path("/mnt/data/README.md")
path.write_text(readme, encoding="utf-8")
print(path)/scaled according to a zoom factor, and lets the user paint directly on top of it using mouse or touch events.
