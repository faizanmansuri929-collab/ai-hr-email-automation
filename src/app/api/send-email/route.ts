import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const recipient = formData.get("recipient") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;
    const file = formData.get("file") as File | null;

    if (!recipient || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: (session as any).accessToken });
    const gmail = google.gmail({ version: "v1", auth: authClient });

    let attachments = [];
    
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      attachments.push({
        filename: file.name,
        content: buffer,
        contentType: file.type || "application/pdf"
      });
    } else {
      // Fallback to default resume
      const resumePath = path.join(process.cwd(), "public", "resume.pdf");
      if (fs.existsSync(resumePath)) {
        attachments.push({
          filename: "resume.pdf",
          path: resumePath,
          contentType: "application/pdf"
        });
      } else {
        console.warn("No file uploaded and default resume.pdf not found.");
      }
    }

    const finalBodyHTML = body.replace(/\n/g, '<br/>') + "<br/><br/><br/><p style='color: #666; font-size: 12px;'><em>This mail is sent by Faizan Automation System</em></p>";

    // Build raw email using nodemailer
    let mail = new MailComposer({
      to: recipient,
      subject: subject,
      html: finalBodyHTML,
      attachments: attachments,
      textEncoding: "base64"
    });

    const messageBuffer = await mail.compile().build();
    const encodedMessage = Buffer.from(messageBuffer)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return NextResponse.json({ success: true, messageId: res.data.id });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
