# 🎨 AI Image Generator API

Free & open AI image generation API built on Cloudflare Workers AI.

## Usage
POST request with JSON: `{ "prompt": "your text" }`

## Example
curl -X POST https://your-worker.workers.dev -H "Content-Type: application/json" -d '{"prompt":"a cat"}' --output image.jpg
