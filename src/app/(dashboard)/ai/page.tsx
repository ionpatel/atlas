"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Package,
  FileText,
  Users,
  BarChart3,
  Calculator,
  Lightbulb,
  Loader2,
  User,
  Copy,
  Check,
  Wand2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUERIES = [
  { icon: Package, label: "Show low stock items", query: "Which products are running low on stock?" },
  { icon: FileText, label: "Overdue invoices", query: "Show me all overdue invoices and their total value" },
  { icon: Users, label: "Top customers", query: "Who are my top 10 customers by revenue?" },
  { icon: BarChart3, label: "Revenue this month", query: "What's my total revenue this month compared to last month?" },
  { icon: Calculator, label: "Profit margins", query: "Calculate my profit margins by product category" },
  { icon: Lightbulb, label: "Business insights", query: "Give me 5 actionable insights to improve my business" },
];

// Simulated AI responses for demo mode
function generateDemoResponse(query: string): string {
  const q = query.toLowerCase();
  
  if (q.includes("low stock") || q.includes("stock")) {
    return `📦 **Low Stock Alert**\n\nI found **7 products** below their reorder point:\n\n| Product | Current Stock | Reorder Point | Status |\n|---------|--------------|---------------|--------|\n| Widget Pro X | 3 | 25 | 🔴 Critical |\n| Cable USB-C 2m | 8 | 50 | 🔴 Critical |\n| Screen Protector | 12 | 30 | 🟡 Low |\n| Laptop Stand | 15 | 20 | 🟡 Low |\n| Mouse Pad XL | 18 | 25 | 🟡 Low |\n| Phone Case Pro | 22 | 30 | 🟡 Low |\n| Desk Organizer | 24 | 30 | 🟡 Low |\n\n💡 **Recommendation:** I suggest creating a purchase order for the critical items immediately. Want me to draft one?`;
  }
  
  if (q.includes("overdue") || q.includes("invoice")) {
    return `📋 **Overdue Invoices Summary**\n\nYou have **4 overdue invoices** totaling **$12,450.00**:\n\n| Invoice | Customer | Amount | Days Overdue |\n|---------|----------|--------|-------------|\n| INV-2026-089 | Maple Tech Inc. | $4,200.00 | 15 days |\n| INV-2026-085 | Northern Supplies | $3,750.00 | 22 days |\n| INV-2026-078 | Bay Street Co. | $2,800.00 | 31 days |\n| INV-2026-071 | Pacific Retail | $1,700.00 | 45 days |\n\n⚠️ **Action Required:** INV-2026-071 is 45 days overdue. Consider sending a final reminder or escalating.\n\n💡 **Tip:** Enable automatic payment reminders in Settings → Notifications to reduce overdue invoices by up to 40%.`;
  }
  
  if (q.includes("top customer") || q.includes("customer")) {
    return `👥 **Top 10 Customers by Revenue (Last 12 Months)**\n\n| Rank | Customer | Revenue | Orders | Avg. Order |\n|------|----------|---------|--------|------------|\n| 1 | Maple Tech Inc. | $45,200 | 28 | $1,614 |\n| 2 | Northern Supplies Co. | $38,900 | 35 | $1,111 |\n| 3 | Bay Street Solutions | $32,100 | 19 | $1,689 |\n| 4 | Pacific Retail Group | $28,750 | 42 | $684 |\n| 5 | Toronto Digital | $24,300 | 15 | $1,620 |\n| 6 | Ottawa Tech Hub | $21,800 | 22 | $991 |\n| 7 | Prairie Logistics | $19,500 | 31 | $629 |\n| 8 | Maritime Trading | $17,200 | 18 | $956 |\n| 9 | BC Innovations | $15,800 | 12 | $1,317 |\n| 10 | Alberta Systems | $14,900 | 24 | $621 |\n\n📊 **Insight:** Your top 3 customers represent 42% of total revenue. Consider loyalty discounts to retain them.`;
  }
  
  if (q.includes("revenue") || q.includes("month")) {
    return `💰 **Monthly Revenue Comparison**\n\n| Metric | This Month | Last Month | Change |\n|--------|-----------|------------|--------|\n| Revenue | $47,250 | $42,800 | +10.4% 📈 |\n| Orders | 156 | 142 | +9.9% 📈 |\n| Avg. Order Value | $303 | $301 | +0.5% |\n| New Customers | 12 | 8 | +50% 📈 |\n| Repeat Customers | 89 | 85 | +4.7% |\n\n📈 **Trend:** Revenue is up 10.4% month-over-month! The increase is driven primarily by:\n1. **12 new customers** (50% increase)\n2. **Higher repeat order rate** from existing customers\n3. **Seasonal demand** for your top-selling categories\n\n🎯 **Forecast:** At this growth rate, you're on track for **$52,000** next month.`;
  }
  
  if (q.includes("profit") || q.includes("margin")) {
    return `📊 **Profit Margins by Category**\n\n| Category | Revenue | COGS | Margin | Margin % |\n|----------|---------|------|--------|----------|\n| Electronics | $28,400 | $18,460 | $9,940 | 35.0% |\n| Accessories | $12,300 | $6,150 | $6,150 | 50.0% |\n| Software | $8,500 | $1,700 | $6,800 | 80.0% |\n| Services | $15,200 | $7,600 | $7,600 | 50.0% |\n| Hardware | $22,100 | $15,470 | $6,630 | 30.0% |\n| **Total** | **$86,500** | **$49,380** | **$37,120** | **42.9%** |\n\n💡 **Insights:**\n- **Software** has the highest margins (80%) — consider expanding this category\n- **Hardware** has the lowest margins (30%) — review supplier pricing\n- Overall margin of 42.9% is healthy for a Canadian SMB`;
  }
  
  if (q.includes("insight") || q.includes("improve")) {
    return `🧠 **5 Actionable Business Insights**\n\n**1. 🔴 Address Overdue Invoices**\nYou have $12,450 in overdue invoices. Enable automated reminders to recover this cash faster.\n\n**2. 📦 Optimize Inventory Levels**\n7 products are below reorder point. Set up automatic reorder rules to prevent stockouts.\n\n**3. 👥 Nurture Top Customers**\nYour top 3 customers drive 42% of revenue. Launch a loyalty program or volume discounts.\n\n**4. 📈 Expand High-Margin Categories**\nSoftware products have 80% margins vs 30% for hardware. Shift marketing spend accordingly.\n\n**5. 🔄 Improve Cash Flow Cycle**\nAverage payment collection is 28 days. Offering 2% early payment discount could reduce this to 15 days, freeing up ~$25K in working capital.\n\n💡 **Quick Win:** Implementing insight #1 alone could recover $12,450 within 30 days.`;
  }
  
  return `I analyzed your query: "${query}"\n\n📊 **Here's what I found:**\n\nBased on your current business data:\n- **Total Revenue (YTD):** $347,200\n- **Active Products:** 245\n- **Total Customers:** 189\n- **Open Invoices:** 23 ($34,500)\n- **Pending Orders:** 8\n\nI can help you with:\n- 📦 Inventory analysis and forecasting\n- 💰 Financial reports and insights\n- 👥 Customer analytics\n- 📋 Invoice management\n- 📈 Sales trends and predictions\n\nTry asking me something specific like "Which products should I reorder?" or "Show my cash flow forecast for next quarter."`;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm Atlas AI, your intelligent business assistant. I can analyze your data, generate reports, answer questions, and provide actionable insights.\n\nTry asking me about your inventory, invoices, customers, revenue, or ask for business recommendations!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: generateDemoResponse(userMessage.content),
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSuggestion = (query: string) => {
    setInput(query);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#1a2a29] flex items-center justify-center shadow-lg">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--foreground)]">Atlas AI Assistant</h1>
          <p className="text-xs text-[var(--muted-foreground)]">Ask anything about your business data</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === "user"
                  ? "bg-white text-white"
                  : "bg-gradient-to-br from-[#DC2626] to-[#1a2a29] text-white"
              }`}
            >
              {msg.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-white text-white"
                  : "bg-[var(--secondary)] text-[var(--foreground)]"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.role === "assistant" && msg.id !== "welcome" && (
                <button
                  onClick={() => handleCopy(msg.content, msg.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check className="h-3 w-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#DC2626] to-[#1a2a29] flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="bg-[var(--secondary)] rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#111827]" />
              <span className="text-sm text-[var(--muted-foreground)]">Analyzing your data...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
          {SUGGESTED_QUERIES.map((sq) => (
            <button
              key={sq.label}
              onClick={() => handleSuggestion(sq.query)}
              className="flex items-center gap-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] transition-colors text-left group"
            >
              <sq.icon className="h-4 w-4 text-[#111827] flex-shrink-0" />
              <span className="text-xs font-medium text-[var(--foreground)] group-hover:text-[#111827] transition-colors">
                {sq.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Atlas AI anything about your business..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#E5E7EB] transition-all"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="h-[46px] w-[46px] rounded-xl bg-white text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
