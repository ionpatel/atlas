/**
 * Email Templates for Atlas ERP
 *
 * Clean, responsive HTML email templates for various notifications.
 * Design matches Atlas ERP branding (dark theme, warm gold accents).
 */

// Base styles shared across templates
const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #111111;
    color: #f5f0eb;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 20px;
  }
  .header {
    text-align: center;
    margin-bottom: 32px;
  }
  .logo {
    font-size: 28px;
    font-weight: 700;
    color: #CDB49E;
    letter-spacing: -0.5px;
  }
  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #f5f0eb;
    margin: 0 0 8px 0;
  }
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #f5f0eb;
    margin: 0 0 16px 0;
  }
  p {
    color: #888888;
    font-size: 14px;
    line-height: 1.6;
    margin: 0 0 16px 0;
  }
  .highlight {
    color: #f5f0eb;
    font-weight: 500;
  }
  .accent {
    color: #CDB49E;
  }
  .btn {
    display: inline-block;
    background-color: #CDB49E;
    color: #111111;
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 8px;
    margin: 16px 0;
  }
  .btn:hover {
    background-color: #d4c0ad;
  }
  .alert-box {
    background-color: #3a2a28;
    border: 1px solid #5a3a38;
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
  }
  .alert-box.warning {
    background-color: #3a3028;
    border-color: #5a4a38;
  }
  .alert-box.success {
    background-color: #283a28;
    border-color: #385a38;
  }
  .stat-grid {
    display: table;
    width: 100%;
    margin: 16px 0;
  }
  .stat-item {
    display: table-cell;
    text-align: center;
    padding: 16px;
    background-color: #222222;
    border-radius: 8px;
  }
  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #f5f0eb;
  }
  .stat-label {
    font-size: 12px;
    color: #888888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
  }
  .divider {
    border: 0;
    border-top: 1px solid #2a2a2a;
    margin: 24px 0;
  }
  .footer {
    text-align: center;
    padding: 24px;
    color: #555555;
    font-size: 12px;
  }
  .footer a {
    color: #888888;
    text-decoration: none;
  }
  .table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  }
  .table th {
    text-align: left;
    padding: 12px;
    background-color: #222222;
    color: #888888;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #2a2a2a;
  }
  .table td {
    padding: 12px;
    color: #f5f0eb;
    font-size: 14px;
    border-bottom: 1px solid #2a2a2a;
  }
  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }
  .badge-warning {
    background-color: #3a3028;
    color: #CDB49E;
  }
  .badge-danger {
    background-color: #3a2a28;
    color: #f87171;
  }
  .badge-success {
    background-color: #283a28;
    color: #34d399;
  }
`;

function wrapTemplate(content: string, previewText?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  ${previewText ? `<meta name="description" content="${previewText}">` : ""}
  <title>Atlas ERP</title>
  <style>${baseStyles}</style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ""}
  <div class="container">
    <div class="header">
      <div class="logo">Atlas</div>
    </div>
    ${content}
    <div class="footer">
      <p>This email was sent by Atlas ERP</p>
      <p>
        <a href="#">Manage Preferences</a> · 
        <a href="#">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ============================================================
// LOW STOCK ALERT
// ============================================================

export interface LowStockAlertParams {
  productName: string;
  currentQty: number;
  minQty: number;
  sku?: string;
  orgName: string;
}

export function lowStockAlertEmail(params: LowStockAlertParams): string {
  const content = `
    <div class="card">
      <h1>⚠️ Low Stock Alert</h1>
      <p>A product in your inventory has fallen below the minimum stock level.</p>
      
      <div class="alert-box warning">
        <h2 style="margin:0 0 8px 0;">${params.productName}</h2>
        ${params.sku ? `<p style="margin:0;"><span class="accent">SKU:</span> ${params.sku}</p>` : ""}
      </div>
      
      <table class="table">
        <tr>
          <td>Current Stock</td>
          <td style="text-align:right;">
            <span class="badge badge-danger">${params.currentQty} units</span>
          </td>
        </tr>
        <tr>
          <td>Minimum Required</td>
          <td style="text-align:right;">
            <span class="badge badge-warning">${params.minQty} units</span>
          </td>
        </tr>
        <tr>
          <td>Shortage</td>
          <td style="text-align:right;">
            <span class="highlight">${params.minQty - params.currentQty} units</span>
          </td>
        </tr>
      </table>
      
      <a href="#" class="btn">View Product →</a>
      
      <hr class="divider">
      <p style="font-size:12px;color:#555555;">
        You're receiving this because low stock alerts are enabled for ${params.orgName}.
      </p>
    </div>
  `;

  return wrapTemplate(content, `Low stock alert: ${params.productName} is at ${params.currentQty} units`);
}

// ============================================================
// INVOICE REMINDER
// ============================================================

export interface InvoiceReminderParams {
  invoiceNumber: string;
  customerName: string;
  amount: string;
  currency: string;
  dueDate: string;
  daysUntilDue: number; // negative = overdue
  orgName: string;
}

export function invoiceReminderEmail(params: InvoiceReminderParams): string {
  const isOverdue = params.daysUntilDue < 0;
  const daysText = isOverdue
    ? `${Math.abs(params.daysUntilDue)} days overdue`
    : params.daysUntilDue === 0
      ? "Due today"
      : `Due in ${params.daysUntilDue} days`;

  const alertClass = isOverdue ? "alert-box" : "alert-box warning";
  const badgeClass = isOverdue ? "badge-danger" : params.daysUntilDue <= 3 ? "badge-warning" : "badge-success";

  const title = isOverdue
    ? "🔴 Invoice Overdue"
    : params.daysUntilDue <= 3
      ? "⚠️ Invoice Due Soon"
      : "📋 Invoice Reminder";

  const content = `
    <div class="card">
      <h1>${title}</h1>
      <p>This is a reminder about an outstanding invoice.</p>
      
      <div class="${alertClass}">
        <table style="width:100%;">
          <tr>
            <td>
              <p style="margin:0;color:#888888;">Invoice</p>
              <p style="margin:4px 0 0 0;font-size:18px;font-weight:600;color:#f5f0eb;">#${params.invoiceNumber}</p>
            </td>
            <td style="text-align:right;">
              <p style="margin:0;color:#888888;">Amount</p>
              <p style="margin:4px 0 0 0;font-size:18px;font-weight:600;color:#CDB49E;">${params.currency} ${params.amount}</p>
            </td>
          </tr>
        </table>
      </div>
      
      <table class="table">
        <tr>
          <td>Customer</td>
          <td style="text-align:right;" class="highlight">${params.customerName}</td>
        </tr>
        <tr>
          <td>Due Date</td>
          <td style="text-align:right;">${params.dueDate}</td>
        </tr>
        <tr>
          <td>Status</td>
          <td style="text-align:right;">
            <span class="badge ${badgeClass}">${daysText}</span>
          </td>
        </tr>
      </table>
      
      <a href="#" class="btn">View Invoice →</a>
      
      <hr class="divider">
      <p style="font-size:12px;color:#555555;">
        You're receiving this because invoice reminders are enabled for ${params.orgName}.
      </p>
    </div>
  `;

  return wrapTemplate(content, `Invoice #${params.invoiceNumber} - ${daysText} (${params.currency} ${params.amount})`);
}

// ============================================================
// NEW ORDER NOTIFICATION
// ============================================================

export interface NewOrderParams {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  totalAmount: string;
  currency: string;
  itemCount: number;
  items?: { name: string; qty: number; price: string }[];
  orgName: string;
}

export function newOrderEmail(params: NewOrderParams): string {
  const itemsTable =
    params.items && params.items.length > 0
      ? `
      <table class="table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${params.items
            .map(
              (item) => `
            <tr>
              <td>${item.name}</td>
              <td style="text-align:center;">${item.qty}</td>
              <td style="text-align:right;">${item.price}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `
      : "";

  const content = `
    <div class="card">
      <h1>🎉 New Order Received</h1>
      <p>Great news! You've received a new order.</p>
      
      <div class="alert-box success">
        <table style="width:100%;">
          <tr>
            <td>
              <p style="margin:0;color:#888888;">Order</p>
              <p style="margin:4px 0 0 0;font-size:18px;font-weight:600;color:#f5f0eb;">#${params.orderNumber}</p>
            </td>
            <td style="text-align:right;">
              <p style="margin:0;color:#888888;">Total</p>
              <p style="margin:4px 0 0 0;font-size:18px;font-weight:600;color:#34d399;">${params.currency} ${params.totalAmount}</p>
            </td>
          </tr>
        </table>
      </div>
      
      <table class="table">
        <tr>
          <td>Customer</td>
          <td style="text-align:right;" class="highlight">${params.customerName}</td>
        </tr>
        ${params.customerEmail ? `<tr><td>Email</td><td style="text-align:right;">${params.customerEmail}</td></tr>` : ""}
        <tr>
          <td>Items</td>
          <td style="text-align:right;">${params.itemCount} item${params.itemCount !== 1 ? "s" : ""}</td>
        </tr>
      </table>
      
      ${itemsTable}
      
      <a href="#" class="btn">View Order →</a>
      
      <hr class="divider">
      <p style="font-size:12px;color:#555555;">
        You're receiving this because new order notifications are enabled for ${params.orgName}.
      </p>
    </div>
  `;

  return wrapTemplate(content, `New order #${params.orderNumber} from ${params.customerName} - ${params.currency} ${params.totalAmount}`);
}

// ============================================================
// DAILY DIGEST
// ============================================================

export interface DailyDigestParams {
  orgName: string;
  date: string;
  stats: {
    newOrders: number;
    revenue: string;
    currency: string;
    invoicesPaid: number;
    lowStockItems: number;
  };
  topItems?: { name: string; sold: number }[];
  alerts?: string[];
}

export function dailyDigestEmail(params: DailyDigestParams): string {
  const content = `
    <div class="card">
      <h1>📊 Daily Summary</h1>
      <p>Here's what happened at <span class="highlight">${params.orgName}</span> on ${params.date}.</p>
      
      <div style="display:flex;gap:12px;margin:24px 0;">
        <div style="flex:1;text-align:center;padding:20px;background-color:#222222;border-radius:8px;">
          <div class="stat-value">${params.stats.newOrders}</div>
          <div class="stat-label">New Orders</div>
        </div>
        <div style="flex:1;text-align:center;padding:20px;background-color:#222222;border-radius:8px;">
          <div class="stat-value" style="color:#34d399;">${params.stats.currency}${params.stats.revenue}</div>
          <div class="stat-label">Revenue</div>
        </div>
        <div style="flex:1;text-align:center;padding:20px;background-color:#222222;border-radius:8px;">
          <div class="stat-value">${params.stats.invoicesPaid}</div>
          <div class="stat-label">Paid Invoices</div>
        </div>
      </div>
      
      ${
        params.stats.lowStockItems > 0
          ? `
        <div class="alert-box warning">
          <p style="margin:0;">
            <strong>⚠️ ${params.stats.lowStockItems} item${params.stats.lowStockItems !== 1 ? "s" : ""}</strong> 
            ${params.stats.lowStockItems !== 1 ? "are" : "is"} below minimum stock level.
          </p>
        </div>
      `
          : ""
      }
      
      ${
        params.topItems && params.topItems.length > 0
          ? `
        <h2>Top Selling Items</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align:right;">Units Sold</th>
            </tr>
          </thead>
          <tbody>
            ${params.topItems
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td style="text-align:right;">${item.sold}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `
          : ""
      }
      
      ${
        params.alerts && params.alerts.length > 0
          ? `
        <h2>Alerts</h2>
        <ul style="margin:0;padding-left:20px;">
          ${params.alerts.map((alert) => `<li style="color:#888888;margin-bottom:8px;">${alert}</li>`).join("")}
        </ul>
      `
          : ""
      }
      
      <a href="#" class="btn">View Dashboard →</a>
    </div>
  `;

  return wrapTemplate(content, `Daily summary for ${params.date}: ${params.stats.newOrders} orders, ${params.stats.currency}${params.stats.revenue} revenue`);
}

// ============================================================
// WEEKLY DIGEST
// ============================================================

export interface WeeklyDigestParams {
  orgName: string;
  weekRange: string; // e.g., "Feb 5 - Feb 11, 2024"
  stats: {
    totalOrders: number;
    totalRevenue: string;
    currency: string;
    avgOrderValue: string;
    invoicesSent: number;
    invoicesPaid: number;
    newCustomers: number;
  };
  comparison?: {
    ordersChange: number; // percentage
    revenueChange: number;
  };
}

export function weeklyDigestEmail(params: WeeklyDigestParams): string {
  const formatChange = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    const color = value >= 0 ? "#34d399" : "#f87171";
    return `<span style="color:${color};">${sign}${value}%</span>`;
  };

  const content = `
    <div class="card">
      <h1>📈 Weekly Report</h1>
      <p>Here's your weekly summary for <span class="highlight">${params.orgName}</span>.</p>
      <p style="color:#555555;font-size:12px;">${params.weekRange}</p>
      
      <div style="display:flex;gap:12px;margin:24px 0;">
        <div style="flex:1;text-align:center;padding:20px;background-color:#222222;border-radius:8px;">
          <div class="stat-value">${params.stats.totalOrders}</div>
          <div class="stat-label">Total Orders</div>
          ${params.comparison ? `<div style="font-size:12px;margin-top:4px;">${formatChange(params.comparison.ordersChange)} vs last week</div>` : ""}
        </div>
        <div style="flex:1;text-align:center;padding:20px;background-color:#222222;border-radius:8px;">
          <div class="stat-value" style="color:#CDB49E;">${params.stats.currency}${params.stats.totalRevenue}</div>
          <div class="stat-label">Revenue</div>
          ${params.comparison ? `<div style="font-size:12px;margin-top:4px;">${formatChange(params.comparison.revenueChange)} vs last week</div>` : ""}
        </div>
      </div>
      
      <table class="table">
        <tr>
          <td>Average Order Value</td>
          <td style="text-align:right;" class="highlight">${params.stats.currency}${params.stats.avgOrderValue}</td>
        </tr>
        <tr>
          <td>Invoices Sent</td>
          <td style="text-align:right;">${params.stats.invoicesSent}</td>
        </tr>
        <tr>
          <td>Invoices Paid</td>
          <td style="text-align:right;">
            <span class="badge badge-success">${params.stats.invoicesPaid}</span>
          </td>
        </tr>
        <tr>
          <td>New Customers</td>
          <td style="text-align:right;">${params.stats.newCustomers}</td>
        </tr>
      </table>
      
      <a href="#" class="btn">View Full Report →</a>
    </div>
  `;

  return wrapTemplate(content, `Weekly report: ${params.stats.totalOrders} orders, ${params.stats.currency}${params.stats.totalRevenue} revenue`);
}
