import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("photo") as File;
  if (!file) return NextResponse.json({ error: "No photo" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const rawType = file.type;
  const mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" =
    rawType === "image/png" ? "image/png"
    : rawType === "image/webp" ? "image/webp"
    : "image/jpeg";

  const client = new Anthropic();

  const msg = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: `This photo shows the fronts of Panini FIFA World Cup 2026 Extra Stickers. Each sticker shows a player or image with a name printed on it.

List all the sticker descriptions you can read clearly. Return ONLY a JSON array of short strings, each describing one sticker, e.g.: ["Lionel Messi - Argentina", "Kylian Mbappé - France", "Erling Haaland - Norway"]

Only include stickers you can read with confidence. If a sticker shows a badge, logo or group photo instead of a player, describe that briefly (e.g. "Argentina - Logo").`,
          },
        ],
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "[]";
  let labels: string[] = [];
  try {
    const match = text.match(/\[[\s\S]*?\]/);
    labels = match ? JSON.parse(match[0]) : [];
  } catch {
    labels = [];
  }

  return NextResponse.json({ labels });
}
