// AI Image Generation API - Cloudflare Worker (OPEN API - No Key Required)
export default {
  async fetch(request, env, ctx) {
    // CORS headers - har response me lagao
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // OPTIONS preflight handle karo
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Simple info endpoint (browser me open karne par)
    if (request.method === "GET" && url.pathname === "/") {
      return new Response(
        JSON.stringify({
          status: "✅ AI Image Generator API is live",
          usage: "POST / with JSON body: { \"prompt\": \"your text here\" }",
          example: {
            method: "POST",
            url: url.origin,
            body: { prompt: "A futuristic city in the clouds" },
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sirf POST allow karo image generate ke liye
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST to generate image." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      const body = await request.json();
      const {
        prompt,
        width = 1024,
        height = 1024,
        steps = 4,
        format = "jpeg", // jpeg ya png
      } = body;

      if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
        return new Response(
          JSON.stringify({ error: "Prompt is required and must be a non-empty string." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`🎨 Generating image: "${prompt}" | ${width}x${height} | steps: ${steps}`);

      // Cloudflare Workers AI - FLUX model
      const aiResponse = await env.AI.run(
        "@cf/black-forest-labs/flux-1-schnell",
        {
          prompt: prompt.trim(),
          width: parseInt(width),
          height: parseInt(height),
          steps: parseInt(steps),
        }
      );

      // Image data nikaalo (base64 ya blob)
      const imageData = aiResponse.image || aiResponse;
      const contentType = format === "png" ? "image/png" : "image/jpeg";

      let imageBlob;
      if (typeof imageData === "string") {
        // base64 string ko binary me convert karo
        const binaryString = atob(imageData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        imageBlob = bytes;
      } else {
        imageBlob = imageData;
      }

      return new Response(imageBlob, {
        headers: {
          ...corsHeaders,
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });

    } catch (error) {
      console.error("❌ Error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to generate image.",
          details: error.message,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  },
};
