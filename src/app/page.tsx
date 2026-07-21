"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send, Copy, Mail, LogOut, CheckCircle2, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DEFAULT_SUBJECT = "Application for AI Engineer Role – Immediate Joiner";
const DEFAULT_BODY = `Dear Hiring Team,

I hope you are doing well.

I am writing to apply for the AI Engineer role.

I am highly interested in building production-ready Generative AI applications, LLM-powered systems, AI Agents, RAG pipelines, and workflow automation.

Currently I am pursuing B.Tech in Artificial Intelligence and Data Science and working as an AI Engineer Intern at MaxBrain Technologies.

My skills include:

• Python
• LangChain
• Llama
• Qwen
• HuggingFace
• LoRA Fine Tuning
• RAG
• AI Agents
• n8n
• FastAPI
• Node.js
• React
• MongoDB
• REST APIs

Projects:

• MCQGyaan
• Gurukul AI
• AI Tutor
• HR Automation System

Please find my resume attached.

Thank you for your time and consideration.

Best Regards

Faizan Mansuri`;

export default function Home() {
  const { data: session, status } = useSession();
  
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>("resume.pdf");
  
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  const [report, setReport] = useState<{total: number, success: number, failed: number, invalid: number} | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setResumeFileName(file.name);
      localStorage.setItem("hr-resume-name", file.name);
      
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        toast.info("Uploading resume to server...");
        const res = await fetch("/api/upload-resume", {
          method: "POST",
          body: formData,
        });
        
        if (res.ok) {
          toast.success("Resume saved permanently for all future emails!");
        } else {
          toast.error("Failed to save resume on server.");
        }
      } catch (err) {
        toast.error("Error uploading resume.");
      }
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const validateEmails = (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rawList = input.split(/[\s,;]+/).filter(e => e.trim() !== "");
    const valid: string[] = [];
    const invalid: string[] = [];
    
    rawList.forEach(email => {
      if (emailRegex.test(email)) valid.push(email);
      else invalid.push(email);
    });
    
    return { valid, invalid, total: rawList.length };
  };

  const handleSend = async () => {
    const { valid, invalid, total } = validateEmails(recipients);
    
    if (invalid.length > 0) {
      toast.warning(`Found ${invalid.length} invalid email(s). They will be skipped.`);
    }
    
    if (valid.length === 0) {
      toast.error("No valid emails found!");
      return;
    }

    setIsSending(true);
    setProgress({ current: 0, total: valid.length });
    setReport(null);
    
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < valid.length; i++) {
      const email = valid[i];
      setProgress({ current: i + 1, total: valid.length });
      
      const formData = new FormData();
      formData.append("recipient", email);
      formData.append("subject", subject);
      formData.append("body", body);
      
      try {
        const res = await fetch("/api/send-email", {
          method: "POST",
          body: formData,
        });
        
        if (res.ok) {
          successCount++;
        } else {
          // Retry once
          const retry = await fetch("/api/send-email", {
            method: "POST",
            body: formData,
          });
          if (retry.ok) successCount++;
          else failedCount++;
        }
      } catch (e) {
        failedCount++;
      }
      
      // 1-second delay for rate limiting
      if (i < valid.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsSending(false);
    setReport({
      total,
      success: successCount,
      failed: failedCount,
      invalid: invalid.length
    });
    
    if (successCount > 0) {
      toast.success("Email(s) Sent Successfully!");
      setRecipients(""); // Clear only recipient email
    }
  };

  useEffect(() => {
    const savedBody = localStorage.getItem("hr-email-body");
    const savedSubject = localStorage.getItem("hr-email-subject");
    const savedResumeName = localStorage.getItem("hr-resume-name");
    
    if (savedBody) setBody(savedBody);
    if (savedSubject) setSubject(savedSubject);
    if (savedResumeName) setResumeFileName(savedResumeName);
  }, []);

  useEffect(() => {
    localStorage.setItem("hr-email-body", body);
    localStorage.setItem("hr-email-subject", subject);
  }, [body, subject]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter" && !isSending) {
        handleSend();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [recipients, subject, body, isSending]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-none">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">AI HR Email Automation</CardTitle>
            <CardDescription className="text-base">Login to start sending job applications</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-8 px-8">
            <Button className="w-full h-12 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all" onClick={() => signIn("google")}>
              Login with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between backdrop-blur-md bg-white/30 dark:bg-slate-900/50 p-4 rounded-2xl border border-white/20 shadow-sm gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">AI HR Email Automation</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">Send Job Application in One Click</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Badge variant="outline" className="hidden sm:inline-flex px-3 py-1 bg-white/50 dark:bg-slate-800 truncate max-w-[150px]">
              {session.user?.email}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <Card className="lg:col-span-2 shadow-xl border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipients" className="text-base font-semibold">Recipient Email(s)</Label>
                <Textarea 
                  id="recipients" 
                  placeholder="Enter HR Email(s) separated by comma, space or newline" 
                  className="min-h-[100px] resize-none text-base rounded-xl transition-all focus:ring-2"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="subject" className="text-base font-semibold">Subject</Label>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(subject, "Subject")} className="h-8 text-xs text-muted-foreground hover:text-primary">
                    <Copy className="w-3 h-3 mr-1" /> Copy Subject
                  </Button>
                </div>
                <Input 
                  id="subject" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-12 text-base font-medium rounded-xl transition-all focus:ring-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="body" className="text-base font-semibold">Email Body</Label>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(body, "Body")} className="h-8 text-xs text-muted-foreground hover:text-primary">
                    <Copy className="w-3 h-3 mr-1" /> Copy Body
                  </Button>
                </div>
                <Textarea 
                  id="body" 
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[350px] font-mono text-sm rounded-xl p-4 transition-all focus:ring-2 leading-relaxed"
                />
                <div className="text-right text-xs text-muted-foreground mt-1">
                  {body.length} characters
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-6 bg-transparent border-t border-slate-100 dark:border-slate-800 pt-6">
              <Button 
                className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-all group" 
                onClick={handleSend}
                disabled={isSending || !recipients}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending {progress.current}/{progress.total}...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Send Email (Ctrl+Enter)
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Card className="shadow-lg border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Paperclip className="w-5 h-5 mr-2 text-blue-500" />
                  Attachment Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center font-bold">
                      PDF
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-sm truncate">{resumeFileName}</p>
                      <p className="text-xs text-muted-foreground">Ready to send</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <input 
                      type="file" 
                      id="resume-upload" 
                      className="hidden" 
                      accept=".pdf" 
                      onChange={handleFileUpload} 
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("resume-upload")?.click()}>
                      Change
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {report && (
              <Card className="shadow-lg border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                      <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{report.total}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Total</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{report.success}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Success</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{report.failed}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Failed</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{report.invalid}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Invalid</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isSending && (
              <Card className="shadow-lg border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Sending Progress</span>
                      <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                    </div>
                    <Progress value={(progress.current / progress.total) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
