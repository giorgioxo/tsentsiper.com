src/
├── app/
│ ├── core/ # Main, global services + layouts
│ │ ├── guards/  
 │ │ ├── interceptors/
│ │ ├── services/ # ApiService, ConfigService, ScrollService etc.
│ │ ├── layouts/ # AppShell, Sidebar, Navbar
│ │ └── core.config.ts
│ │
│ ├── features/ # Business features
│ │ ├── dashboard/ # Main dashboard page
│ │ │ ├── components/
│ │ │ ├── dashboard.page.ts
│ │ │ └── dashboard.page.html/scss
│ │ ├── projects/ # Project list + animations
│ │ │ ├── components/
│ │ │ ├── services/
│ │ │ └── projects.page.ts
│ │ └── contact/ # "Get in touch" feature
│ │
│ ├── shared/ # Reusable UI bits
│ │ ├── components/ # buttons, dropdown, modal, card, etc.
│ │ ├── directives/
│ │ ├── pipes/
│ │ └── models/ # TS interfaces, types
│ │
│ └── app.routes.ts # All routes
│
├── assets/ # static assets
│ ├── i18n/
│ ├── fonts/
│ ├── logos/
│ └── svg/
│
├── styles/ # global styles
│ └── \_variables.scss
│
├── main.ts # client bootstrap
└── main.server.ts # SSR bootstrap
