# Our Learning Adventure with Login!

This document explains how our backend login system works, like telling a story for a five-year-old. It also explains the boo-boos we found and how we fixed them!

### How Login Works (The Simple Story)

Imagine your app is a big, fancy playhouse. Several special files work together to make sure only the right people can come in and play.

**The Main Characters:**

*   `server.js` (The Playhouse Manager): This file is the main boss. It wakes up first, connects to our big toy box (the database), and sets up all the rules for the playhouse. It also hires the bouncer and gives them a map.

*   `config/passport.js` (The Bouncer): The bouncer's name is "Passport". He is very friendly but also very strict. When a visitor arrives from Google, the bouncer checks their Google ID card.
    *   If the visitor has been here before, the bouncer smiles and lets them in.
    *   If it's a new visitor, the bouncer makes a new name tag for them, files it away in the toy box, and then lets them in.
    *   The bouncer also gives each visitor a special, secret cookie as a ticket to prove they are allowed to be inside.

*   `routes/auth.routes.js` (The Map): This is a map of the playhouse that shows all the special login and logout doors.
    *   `/auth/google`: The front door where you show your Google ID card to the bouncer.
    *   `/auth/google/callback`: A special secret door that Google uses to send you back into the playhouse after you've shown your ID.
    *   `/auth/current_user`: A magic door that only works if you have a secret cookie. It shows you who you are.
    *   `/auth/logout`: The exit door. When you go through it, the bouncer takes back your secret cookie.

*   `models/user.model.js` (The Name Tag Design): This file is the blueprint for the name tags the bouncer makes. It says every tag must have a `googleId`, a `displayName`, and an `email`.

*   `package.json` (The Shopping List): This is the shopping list for building our playhouse. It lists all the parts and toys we need (like `express`, `passport`, and `mongoose`).

*   `.env` (The Secret Notebook): This is a very secret notebook that only the Playhouse Manager can read. It contains all the secret keys, like the key to the toy box and the secret recipe for the cookie tickets.

---

### The Boo-Boos We Fixed

We ran into two little problems while building our playhouse, but we fixed them!

#### 1. The Wrong Address for the Toy Box

*   **The Problem:** We first saw a scary error: `MongoServerError: Invalid namespace`.
*   **What it Meant:** We were telling the Playhouse Manager (`server.js`) the address to the toy box (our database) in a confusing way. It was like writing the address as `/123 Toy Street` instead of `123 Toy Street`. The manager saw the weird slash at the beginning and said, "That's not a real address! I can't find it!"
*   **How We Fixed It:** We changed how we told the manager the address. Instead of mashing the street and house number together, we gave them to him on two separate, clear lines using the `dbName` option. Now he knows exactly where to find the toy box!

#### 2. The Bouncer's Missing Tool

*   **The Problem:** After we fixed the address, we saw a new error: `TypeError: req.session.regenerate is not a function`.
*   **What it Meant:** Our bouncer, Passport, has a new security rule. For safety, after he lets someone in, he wants to destroy their old ticket and give them a brand new one. To do this, he needed a special ticket-making tool called `regenerate`.
*   **How We Fixed It:** We realized we had given our bouncer a simple cookie jar (`cookie-session`) to hold the tickets, but this jar didn't have the `regenerate` tool he needed. We swapped the simple jar for a fancier, more powerful one called `express-session` that had all the tools. We updated our shopping list (`package.json`) and told the manager to use the new cookie jar. Now the bouncer is happy, and our playhouse is super secure!
