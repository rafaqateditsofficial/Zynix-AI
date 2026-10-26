# Zynix AI
Chat (text + voice), Image Studio, Video Editor and Pro upgrade portal. Static front end + one optional serverless function.

## Structure
index.html · css/style.css · js/app.js · assets/logo.svg · api/chat.js · vercel.json

## Deploy
1. `git init && git add . && git commit -m "Zynix AI" && git push` to GitHub.
2. Import the repo in Vercel (framework: Other, no build step).
3. Add `ANTHROPIC_API_KEY` in Vercel environment variables to switch chat from demo mode to a real model.

## Important before going live
- Pro unlock is stored in the browser (localStorage). Anyone can bypass it. For real payments, add a backend that stores
  submitted Transaction IDs, lets you approve them after checking your EasyPaisa account, and returns a signed Pro flag.
- Images and videos are generated procedurally in the browser. Connect an image/video model API through new `api/` functions for photoreal output.
