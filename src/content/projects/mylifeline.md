---
# The filename is the URL slug: this file is /work/mylifeline/.
order: 2 # display order on the home page (lowest first)
title: MyLifeLine.org React.JS Web Components
type: Web Development
year: 2018
summary: "The Cancer Support Community non-profit organization uses Advanced Web Components to build custom data-driven front-end components for its cancer patient social media platform. Web components were built in React.JS, jQuery, PHP, and Node.js."
role: Lead Technical Architect
client: MyLifeLine.org (Cancer Support Community)
duration: TODO
team: TODO
tools: [React.JS, jQuery, PHP, Node.js]
# Optional; the buttons only appear when set.
# live: https://example.com
# repo: https://github.com/…
# Optional images, under public/images/projects/. thumb is cropped to 16:10;
# image is the main project image, shown whole at any shape.
thumb:
  { src: /images/projects/csc-project2-400x300.png, alt: "MyLifeLine.org React.JS web components" }
image:
  { src: /images/projects/csc-project2-700x.png, alt: "MyLifeLine.org React.JS web components" }
shots:
  - alt: ""
    caption: "TODO: screenshot caption"
  - alt: ""
    caption: "TODO: screenshot caption"
---

## The brief

MyLifeLine.org is the Cancer Support Community's free social platform, where people facing cancer build a private page to share updates and rally support from family and friends. The platform needed a set of custom front-end components that could show each member's own content and data, such as updates, messages and support activity, in a way that felt simple and personal to people going through treatment.

The components had to fit into the existing site, work with its PHP back end, and be reusable across the many pages of the platform.

## The approach

As lead technical architect, I designed the components as small, self-contained building blocks that could be dropped into any page of the platform.

- **React.JS for data-driven interfaces.** Components that display live member data were built in React.JS, so each one updates cleanly as the data changes without reloading the page.
- **Working with what was already there.** jQuery handled the interactions on existing pages, letting new components sit alongside the current site instead of requiring a full rewrite.
- **A clear data layer.** PHP and Node.js supplied the data each component needed, keeping the front end focused on presentation and making the components easier to test and reuse.

## The outcome

The Cancer Support Community gained a library of reusable, data-driven components for MyLifeLine.org. New features could be assembled from existing pieces, and members got a more responsive, personal experience when sharing their story and receiving support.
