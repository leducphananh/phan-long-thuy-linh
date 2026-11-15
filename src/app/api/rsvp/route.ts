import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import {
  hasLikelySpamContent,
  hasSuspiciousRepetition,
  hasUrlOrContact,
  isValidVietnamPhone,
  normalizeSpaces,
} from '@/lib/spam';
import { getSupabaseClient } from '@/lib/supabase';

interface RSVPRequestBody {
  name: string;
  phone: string;
  attending: boolean | string;
  guestsCount?: number | string;
  side?: 'groom' | 'bride' | 'both';
  message?: string;
  dietaryRequirements?: string;
  website?: string;
}

const getEnv = (key: string): string | null => {
  const value = process.env[key]?.trim();
  return value ? value : null;
};

const getSheetsClient = () => {
  const clientEmail = getEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

export async function POST(req: NextRequest) {
  try {
    const raw = (await req.json()) as Partial<RSVPRequestBody>;

    // Honeypot check
    if (raw.website && raw.website.trim()) {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu không hợp lệ.' },
        { status: 400 }
      );
    }

    const name = typeof raw.name === 'string' ? normalizeSpaces(raw.name) : '';
    const phone = typeof raw.phone === 'string' ? normalizeSpaces(raw.phone) : '';
    const message = typeof raw.message === 'string' ? normalizeSpaces(raw.message) : '';

    // Validate name
    if (!name || name.length < 2 || name.length > 50 || hasSuspiciousRepetition(name)) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập họ và tên hợp lệ (từ 2 đến 50 ký tự).' },
        { status: 400 }
      );
    }

    // Validate phone
    if (!phone || !isValidVietnamPhone(phone)) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số).' },
        { status: 400 }
      );
    }

    // Validate message spam
    if (
      message.length > 280 ||
      hasSuspiciousRepetition(message) ||
      hasLikelySpamContent(message) ||
      hasUrlOrContact(message)
    ) {
      return NextResponse.json(
        { success: false, message: 'Nội dung lời nhắn có dấu hiệu bất thường hoặc chứa liên kết quảng cáo.' },
        { status: 400 }
      );
    }

    const attending = raw.attending === true || raw.attending === 'yes' || raw.attending === 'true';
    const guestsCount = Number(raw.guestsCount) || 1;
    const side = raw.side || 'both';

    const now = new Date();
    const timestamp = now.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const attendanceLabel = attending ? 'Có tham dự' : 'Không thể tham dự';
    const sideLabel = side === 'groom' ? 'Nhà Trai' : side === 'bride' ? 'Nhà Gái' : 'Cả hai bên';

    let savedToGoogleSheets = false;

    // 1. Ghi dữ liệu qua Google Sheets Service Account (v4 API) giống wedding-page-clone
    const sheetId = getEnv('GOOGLE_SHEET_ID');
    const sheetName = getEnv('GOOGLE_SHEET_NAME') ?? 'RSVP';
    const sheets = getSheetsClient();

    if (sheetId && sheets) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: `${sheetName}!A:G`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [
              [
                timestamp,
                name,
                "'" + phone, // Prefix ' để bảo toàn số 0 ở đầu
                attendanceLabel,
                sideLabel,
                guestsCount,
                message,
              ],
            ],
          },
        });
        savedToGoogleSheets = true;
      } catch (sheetsErr: any) {
        console.warn('Lỗi ghi Google Sheets Service Account:', sheetsErr?.message || sheetsErr);
      }
    }

    // 2. Fallback: Nếu có GOOGLE_SHEET_WEBHOOK_URL
    const webhookUrl = getEnv('GOOGLE_SHEET_WEBHOOK_URL');
    if (!savedToGoogleSheets && webhookUrl && webhookUrl.startsWith('https://')) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp,
            name,
            phone,
            attending,
            guestsCount,
            side,
            message,
          }),
        });
        savedToGoogleSheets = true;
      } catch (webhookErr) {
        console.warn('Lỗi gửi Webhook Google Sheet:', webhookErr);
      }
    }

    // 3. Sao lưu vào Supabase (nếu có cấu hình)
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('rsvp').insert([
          {
            name,
            phone,
            attending,
            guests_count: guestsCount,
            side,
            message,
            dietary_requirements: raw.dietaryRequirements || null,
          },
        ]);
      }
    } catch {
      // Supabase table là tùy chọn dự phòng
    }

    return NextResponse.json({
      success: true,
      message: 'Xác nhận tham dự của bạn đã được ghi nhận thành công!',
      mode: savedToGoogleSheets ? 'google_sheet' : 'supabase',
      data: {
        name,
        phone,
        attending,
        guestsCount,
        side,
        message,
        timestamp,
      },
    });
  } catch (err: any) {
    console.error('RSVP API route error:', err);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
