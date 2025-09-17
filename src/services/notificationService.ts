/*
  Notification Service
  - Sends critical-stage email alerts if EmailJS public configuration is provided
  - Safe no-op if not configured; never throws to the UI layer
*/

export interface CriticalAlertPayload {
  batchId?: string;
  avgQuality?: number;
  worstStatus?: string;
  shelfLifeDays?: number;
  timestamp?: string;
}

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

const isConfigured = Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);

export function getEmailConfigStatus() {
  return {
    configured: isConfigured,
    missing: {
      serviceId: !EMAILJS_SERVICE_ID,
      templateId: !EMAILJS_TEMPLATE_ID,
      publicKey: !EMAILJS_PUBLIC_KEY
    }
  };
}

const getEmailPreference = (): boolean => {
  try {
    const stored = localStorage.getItem('onionwatch-email-notifications');
    if (stored === null) return true; // default on
    return stored === 'true';
  } catch {
    return true;
  }
};

export const getAlertRecipientEmail = (): string | undefined => {
  try {
    const stored = localStorage.getItem('onionwatch-alert-email');
    return stored || undefined;
  } catch {
    return undefined;
  }
};

export const setAlertRecipientEmail = (email: string) => {
  try { localStorage.setItem('onionwatch-alert-email', email); } catch {}
};

export async function sendEmail(toEmail: string, subject: string, message: string, extraParams?: Record<string, any>): Promise<boolean> {
  if (!toEmail) return false;
  if (!getEmailPreference()) return false;
  if (!isConfigured) {
    console.warn('[Notifications] EmailJS not configured. Skipping email send.');
    return false;
  }

  try {
    const payload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: toEmail,
        subject,
        message,
        ...(extraParams || {})
      }
    };

    const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`EmailJS responded ${resp.status}: ${text}`);
    }
    return true;
  } catch (error) {
    console.error('[Notifications] Email send failed:', error);
    return false;
  }
}

export async function sendCriticalAlert(toEmail: string, data: CriticalAlertPayload): Promise<boolean> {
  const subject = `CRITICAL: Batch ${data.batchId || ''} requires immediate attention`;
  const lines = [
    `Status: ${data.worstStatus || 'critical'}`,
    data.avgQuality !== undefined ? `Average quality score: ${Math.round(data.avgQuality)}%` : undefined,
    data.shelfLifeDays !== undefined ? `Estimated shelf-life: ${data.shelfLifeDays} days` : undefined,
    `Time: ${data.timestamp || new Date().toLocaleString()}`
  ].filter(Boolean);

  const message = lines.join('\n');
  return await sendEmail(toEmail, subject, message, { batch_id: data.batchId || 'N/A' });
}

export default {
  sendEmail,
  sendCriticalAlert
};


