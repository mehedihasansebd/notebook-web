# Notebook Web

Web app for the Notebook API: private notes, public posts and an admin area.

**Live:** https://`<vercel-url>` · **API:** https://`<render-url>`/api

> The API runs on a free Render instance. After a period of inactivity the first request can take up to a minute while it wakes up.

## Tech stack

| Area      | Choice                                                   |
| --------- | -------------------------------------------------------- |
| Framework | Angular 20 (standalone components, signals, lazy routes) |
| Language  | TypeScript                                               |
| Styling   | Tailwind CSS 4                                           |
| Forms     | Reactive Forms                                           |
| HTTP      | `HttpClient` with a functional JWT interceptor           |
| Hosting   | Static build (Vercel)                                    |

## Project structure

```
src/app/
  core/       auth service, API service, JWT interceptor, route guards, navbar, models
  shared/     pagination component
  features/
    auth/     login, register
    notes/    notes page (create, edit, delete, paginate)
    posts/    posts page, posts of one author
    profile/  profile page
    admin/    users, all notes, users grouped by interest
src/environments/   API address for development and production
```

How it fits together:

- **Auth:** the token and user live in a signal and are mirrored to `localStorage`, so a refresh keeps you signed in.
- **Interceptor:** adds `Authorization: Bearer <token>` to every API call and signs the user out on a 401.
- **Guards:** `authGuard` protects user pages, `adminGuard` protects `/admin/*`.

## Setup

Requirements: Node.js 20+, and the [notebook-api](https://github.com/mehedihasansebd/notebook-api) running locally (follow its README, including `npm run seed:admin` and `npm run seed:sample`).

```bash
git clone https://github.com/mehedihasansebd/notebook-web.git
cd notebook-web
npm install
npm start
```

Open http://localhost:4200.

The API address is set in the environment files:

| File                                          | Used by         | Value                       |
| --------------------------------------------- | --------------- | --------------------------- |
| `src/environments/environment.development.ts` | `npm start`     | `http://localhost:5000/api` |
| `src/environments/environment.ts`             | `npm run build` | the deployed API URL        |

The API must allow this origin: its `CLIENT_URL` must include `http://localhost:4200`.

## Scripts

| Command         | What it does                                      |
| --------------- | ------------------------------------------------- |
| `npm start`     | Development server with live reload               |
| `npm run build` | Production build into `dist/notebook-web/browser` |

## Pages

| Route                 | Who      | What                                                 |
| --------------------- | -------- | ---------------------------------------------------- |
| `/posts`              | everyone | Public posts; publish one when logged in             |
| `/users/:id`          | everyone | All posts of one author                              |
| `/login`, `/register` | guests   | Authentication                                       |
| `/notes`              | users    | Create, edit, delete and page through your own notes |
| `/profile`            | users    | Update name and interests                            |
| `/admin/users`        | admin    | List, add, edit and delete users                     |
| `/admin/notes`        | admin    | Read every note                                      |
| `/admin/interests`    | admin    | Users grouped by interest, with a filter             |

## Verify everything

Accounts: the admin is the one set in the API's `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Demo users (from `seed:sample`) use the password `Password123`, for example `ayesha@example.com`.

**As a guest**

1. Open `/posts`: posts are listed with pagination (Next / Previous).
2. Click an author's name: `/users/:id` shows that author's posts.
3. Open `/notes` directly: you are sent to `/login`.

**As a user** 4. Register a new account with a few interests: you land on `/notes`, the navbar shows your name and role. 5. Add a note, edit it, delete it. With more than 5 notes, pagination appears. 6. Refresh the page: you stay signed in. Use Log out: you return to `/login`. 7. Publish a post on `/posts`: it appears at the top. 8. Change your name and interests on `/profile`: the navbar updates. 9. Open `/admin/users` by URL: you are redirected away, and the admin links are not in the navbar.

**As the admin** 10. Navbar shows Users, All notes and Interests. 11. `/admin/users`: add a user, change their role, delete a user. Deleting your own account is refused with a message. 12. `/admin/notes`: notes from every user, with owner name and email, paginated. 13. `/admin/interests`: users grouped by interest with counts. Filter by `chess`, then clear the filter.

**Errors** 14. Log in with a wrong password: an error message is shown. 15. Stop the API and reload: pages show "Cannot reach the server" instead of breaking.

## Build and deploy

The build is a static site. On Vercel or Netlify use:

| Setting          | Value                       |
| ---------------- | --------------------------- |
| Build command    | `npm run build`             |
| Output directory | `dist/notebook-web/browser` |

Before building for production, put the deployed API address in `src/environments/environment.ts`. `vercel.json` rewrites every path to `index.html` so deep links and refreshes work.
