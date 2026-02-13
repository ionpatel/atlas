/**
 * Email Service for Atlas ERP
 *
 * Uses Resend API for sending emails with fallback to queue-only mode
 * for development without API key.
 */

import { createClient } from "./supabase/client";

// Types
export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  queued?: boolean;
}

export interface QueueEmailPayload {
  orgId: string;
  type:
    | "low_stock_alert"
    | "invoice_reminder_7d"
    | "invoice_reminder_3d"
    | "invoice_overdue"
    | "new_order"
    | "daily_digest"
    | "weekly_digest";
  recipientEmail: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
  scheduledAt?: Date;
}

// Default sender
const DEFAULT_FROM =
  process.env.RESEND_FROM_EMAIL || "Atlas ERP <notifications@atlas-erp.com>";

/**
 * Send an email via Resend API
 * Falls back to logging in development if no API key
 */
export async function sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  // Development fallback - just log
  if (!apiKey) {
    console.log("[Email] Development mode - email would be sent:", {
      to: payload.to,
      subject: payload.subject,
      from: payload.from || DEFAULT_FROM,
    });

    return {
      success: true,
      queued: true,
      messageId: `dev-${Date.now()}`,
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: payload.from || DEFAULT_FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Email] Resend API error:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.error("[Email] Send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Queue an email for sending (stored in notification_queue table)
 * This allows for retry logic and scheduled sending
 */
export async function queueEmail(payload: QueueEmailPayload): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("queue_notification", {
      p_org_id: payload.orgId,
      p_type: payload.type,
      p_recipient_email: payload.recipientEmail,
      p_subject: payload.subject,
      p_body: payload.body,
      p_metadata: payload.metadata || {},
      p_scheduled_at: payload.scheduledAt?.toISOString() || new Date().toISOString(),
    });

    if (error) {
      console.error("[Email] Queue error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      id: data,
    };
  } catch (error) {
    console.error("[Email] Queue error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a test email to verify configuration
 */
export async function sendTestEmail(to: string): Promise<SendEmailResult> {
  const { lowStockAlertEmail } = await import("./email-templates");

  const html = lowStockAlertEmail({
    productName: "Test Product",
    currentQty: 5,
    minQty: 10,
    sku: "TEST-001",
    orgName: "Your Organization",
  });

  return sendEmail({
    to,
    subject: "🧪 Atlas ERP - Test Email",
    html,
    text: "This is a test email from Atlas ERP to verify your email configuration is working correctly.",
  });
}

/**
 * Process pending notifications from queue
 * This would typically be called by a Supabase Edge Function on a schedule
 */
export async function processPendingNotifications(batchSize = 50): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const supabase = createClient();
  let processed = 0;
  let sent = 0;
  let failed = 0;

  try {
    // Get pending notifications
    const { data: notifications, error } = await supabase.rpc(
      "get_pending_notifications",
      { batch_size: batchSize }
    );

    if (error) {
      console.error("[Email] Failed to get pending notifications:", error);
      return { processed: 0, sent: 0, failed: 0 };
    }

    if (!notifications?.length) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    // Process each notification
    for (const notification of notifications) {
      processed++;

      const result = await sendEmail({
        to: notification.recipient_email,
        subject: notification.subject,
        html: notification.body,
      });

      if (result.success) {
        await supabase.rpc("mark_notification_sent", {
          notification_id: notification.id,
        });
        sent++;
      } else {
        await supabase.rpc("mark_notification_failed", {
          notification_id: notification.id,
          error_msg: result.error || "Unknown error",
        });
        failed++;
      }
    }
  } catch (error) {
    console.error("[Email] Process error:", error);
  }

  return { processed, sent, failed };
}

/**
 * Get notification queue status for an organization
 */
export async function getQueueStatus(orgId: string): Promise<{
  pending: number;
  sent: number;
  failed: number;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notification_queue")
    .select("status")
    .eq("org_id", orgId);

  if (error || !data) {
    return { pending: 0, sent: 0, failed: 0 };
  }

  return {
    pending: data.filter((n: { status: string }) => n.status === "pending").length,
    sent: data.filter((n: { status: string }) => n.status === "sent").length,
    failed: data.filter((n: { status: string }) => n.status === "failed").length,
  };
}
