# Pendo Mtaani

Location-based matchmaking for people in Kenya. Static frontend that runs on Netlify, with accounts, profiles, GPS distance, swipe matching, chat, reports, and an M-Pesa premium demo stored in the browser.

Live product UI. Not a production dating backend: there is no server, so matches and chats stay on this device until you add an API.

## Stack

- HTML, CSS, vanilla JS
- Browser Geolocation API + haversine distance
- localStorage for accounts, likes, matches, messages, reports
- Netlify static hosting

## Run

Open `index.html`, or deploy the folder to Netlify. Publish directory is the repo root. No build step.
