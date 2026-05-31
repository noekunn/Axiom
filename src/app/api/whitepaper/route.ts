import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "OpenAI \u00d7 Outskill _ AI Builders Hackathon 25th May'26.pdf",
    );
    const file = await readFile(filePath);

    return new Response(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="axiom-whitepaper.pdf"',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Whitepaper PDF is not available on this deployment." },
      { status: 404 },
    );
  }
}
