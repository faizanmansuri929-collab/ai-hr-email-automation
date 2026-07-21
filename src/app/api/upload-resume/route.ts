import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const resumePath = path.join(process.cwd(), "public", "resume.pdf");
    fs.writeFileSync(resumePath, buffer);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error uploading resume:", error);
    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 });
  }
}
