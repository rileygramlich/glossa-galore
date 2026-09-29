# Glossa Galore
### Flashcards for the 1000 most common words, plus a journal to put them to use.

#### By [rileygramlich](https://github.com/rileygramlich)

**Try it: [glossa-galore.vercel.app](https://glossa-galore.vercel.app)**

![Glossa Galore home page](./public/images/screenshots/home.png)

## What it does

About a thousand words make up most of everyday speech. Glossa Galore walks you through them in **French, Portuguese or German**.

### Learn
Pick a language and you get a shuffled deck of cards. Tap a card (or press <kbd>Space</kbd>) to flip it and see the English. Then sort it:

- **I know it:** swipe right, press <kbd>→</kbd>, or tap the button. The word goes on your *Known* list and won't be dealt again.
- **Still learning:** swipe left, press <kbd>←</kbd>, or tap the button. The word goes on your *Still learning* list and comes back around later in the session.

Each language keeps its own progress. You can remove any word from either list.

Anyone can practice without an account. Guest progress is saved in the browser, and signing in with Google moves it into your account so it follows you to other devices.

<p>
  <img src="./public/images/screenshots/learn-mobile.png" alt="Flashcard on a phone" width="260">
  <img src="./public/images/screenshots/learn-flipped-mobile.png" alt="Flipped flashcard showing the English" width="260">
  <img src="./public/images/screenshots/journal-mobile.png" alt="Journal on a phone" width="260">
</p>

### Journal
Your journal shows your profile, how many words you know in each language, and a timeline of your entries. Write short entries that use the words you just learned. The form fills in your five most recently learned words for you. Entries can be edited and deleted, and deleting asks you to confirm first.

![Learn page in dark mode](./public/images/screenshots/learn-dark.png)

## Running it locally

You need Node 20+ and MongoDB. The quickest way to get MongoDB is Docker.

```bash
npm install
cp .env.example .env                  # then fill in what you need
docker run -d --name glossa-mongo -p 27017:27017 mongo:7
npm run seed                          # loads data/words.json into Mongo (safe to re-run)
npm run dev                           # http://localhost:9999, restarts on file changes
```

Without Google credentials, set `ALLOW_DEV_LOGIN=true` in `.env`. The sign-in page then gets a **Continue as test user** button. It's ignored when `NODE_ENV=production`.

### Environment

| Variable | |
|---|---|
| `DATABASE_URL` | MongoDB connection string. Defaults to `mongodb://127.0.0.1:27017/glossa-galore`. |
| `SESSION_SECRET` | Required in production. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_SECRET` | Google OAuth client. The callback path is `/oauth2callback`. |
| `GOOGLE_CALLBACK` | Optional full callback URL. By default it's built from the request, which works behind Render's and Vercel's proxies. |
| `ALLOW_DEV_LOGIN` | `true` enables the local test user. Development only. |

### Deploying for free

The live site runs on **Vercel** (Hobby plan) with a free **MongoDB Atlas** cluster, both in Oregon (AWS `us-west-2`, Vercel region Portland `pdx1`). Keep the app and the database in the same region: every page makes several database round trips.

**1. The database (MongoDB Atlas, free M0 cluster)**
- Create a database user. A generated letters-and-numbers password is easiest; symbols like `@ : / ? # %` would need URL-encoding.
- Under **Network Access**, allow `0.0.0.0/0`. Free hosts have no fixed IP address.
- Copy the connection string (Connect → Drivers). Replace `<db_password>`, **angle brackets included**, and add the database name before the `?`:
  `mongodb+srv://glossa:Abc123xyz@cluster0.xxxxx.mongodb.net/glossa-galore?retryWrites=true&w=majority`
- There's no seed step. On first start the app loads the 1000 words into an empty database. `npm run seed` refreshes them later if `data/words.json` changes.

**2. The app on Vercel** (serverless, no sleep; the Hobby plan is for non-commercial use)
- Import the repo. No build settings are needed: Vercel detects the Express app from `server.js` and serves `public/` from its CDN.
- Set the function region to match the database (Settings → Functions).
- Add the environment variables `NODE_ENV=production`, `SESSION_SECRET` (`openssl rand -hex 32`) and `DATABASE_URL`, then **redeploy**. Vercel only picks up changed variables on the next deploy.

**Or on Render** (a normal Node server; the free plan sleeps after 15 idle minutes and takes about a minute to wake): New → Blueprint → this repo. `render.yaml` sets the build and start commands and generates `SESSION_SECRET`. Paste `DATABASE_URL` when asked.

**Google sign-in** is optional. Without it, visitors practice as guests and the sign-in page says accounts are coming soon. To turn it on, create an OAuth client in Google Cloud Console with the redirect URI `https://<your-domain>/oauth2callback`, add `GOOGLE_CLIENT_ID` and `GOOGLE_SECRET`, and redeploy. Anyone who practiced as a guest keeps that progress: it moves into their account the first time they sign in.

**If pages say "Back in a moment"**, the app can't reach the database. The deployment's logs say why, in a line starting `Could not connect to MongoDB`. The usual causes are a wrong password (or a leftover `<db_password>`, which the app also warns about), Network Access not allowing `0.0.0.0/0`, or `DATABASE_URL` added without redeploying.

## How it's built

A server-rendered **MEN** app (MongoDB, Express, Node.js) with EJS templates:

```
server.js            app setup: security headers, sessions (stored in Mongo), passport
config/              database, passport (Google OAuth), languages, shared middleware
models/              Word (the word bank), User (with embedded vocab progress and posts)
routes/ controllers/ index (home, sign-in), learn (decks), words (progress), users (journal), posts
views/               EJS pages and partials
public/              stylesheet, the flashcard script, images
data/                words.json (the word bank) and the original English list
config/words.js      loads the word bank (on startup when empty, or via `npm run seed`), upserting by rank so progress survives
```

- **Data model.** `Word` documents hold one English word with its French, Portuguese and German translations. Users reference words from their `vocab` entries (many to many), and each entry records a language and a status (`known` or `learning`). Journal posts are embedded in the user (one to many).
- **Ownership.** Every journal and progress route works on the signed-in user's own data (`req.user`). URLs contain no user ids, so nobody can reach anyone else's posts.
- **Styling.** Hand-written CSS (no framework), built mobile-first with automatic dark mode. Headings use [Fraunces](https://fonts.google.com/specimen/Fraunces) and the interface uses [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans).
- **Word list.** [The 1000 most common English words](https://gist.github.com/deekayen/4148741).

![Original ERD](./public/images/gg-erd.png)

## Ideas for later
1. More languages
2. Let learners choose how big a deck to shuffle
3. After a session, prompt for a journal entry that uses the new words
4. Show each post in both languages
5. Comments on posts, shown in both languages
6. Follow other learners and see their posts in your feed
7. An About page with help and a donation option
8. Custom profile photo and colours
9. More stats: cards seen, days since you started a language
10. Share the app, individual posts, or a learner's page
