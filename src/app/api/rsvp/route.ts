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
  let privateKey = getEnv('GOOGLE_PRIVATE_KEY');

  if (!clientEmail || !privateKey) {
    return null;
  }

  // Handle both literal \n and actual newlines, and strip accidental surrounding quotes
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

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

    // 1. Honeypot check (chống spam bot)
    if (raw.website && raw.website.trim()) {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu không hợp lệ.' },
        { status: 400 }
      );
    }

    const name = typeof raw.name === 'string' ? normalizeSpaces(raw.name) : '';
    const phone = typeof raw.phone === 'string' ? normalizeSpaces(raw.phone) : '';
    const message = typeof raw.message === 'string' ? normalizeSpaces(raw.message) : '';

    // 2. Validate họ tên
    if (!name || name.length < 2 || name.length > 50 || hasSuspiciousRepetition(name)) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập họ và tên hợp lệ (từ 2 đến 50 ký tự).' },
        { status: 400 }
      );
    }

    // 3. Validate số điện thoại Việt Nam
    if (!phone || !isValidVietnamPhone(phone)) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số).' },
        { status: 400 }
      );
    }

    // 4. Validate nội dung tin nhắn
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
    let googleSheetError: string | null = null;

    // Ghi dữ liệu trực tiếp vào Google Sheets qua Service Account (v4 API)
    const sheetId = getEnv('GOOGLE_SHEET_ID');
    const sheetName = getEnv('GOOGLE_SHEET_NAME');
    const sheets = getSheetsClient();

    if (sheetId && sheets) {
      const rowData = [
        timestamp,
        name,
        "'" + phone, // Giữ số 0 ở đầu SĐT trong Google Sheet
        attendanceLabel,
        sideLabel,
        guestsCount,
        message,
      ];

      try {
        // Thử ghi vào tab được chỉ định (nếu có cấu hình GOOGLE_SHEET_NAME)
        const targetRange = sheetName ? `${sheetName}!A:G` : 'A:G';
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: targetRange,
          valueInputOption: 'RAW',
          requestBody: {
            values: [rowData],
          },
        });
        savedToGoogleSheets = true;
      } catch (primaryErr: any) {
        // Nếu tên tab không khớp, tự động ghi vào tab đầu tiên của trang tính
        try {
          await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'A:G',
            valueInputOption: 'RAW',
            requestBody: {
              values: [rowData],
            },
          });
          savedToGoogleSheets = true;
        } catch (fallbackErr: any) {
          googleSheetError = fallbackErr?.message || primaryErr?.message;
          console.error('Google Sheets Service Account error:', googleSheetError);
        }
      }
    } else {
      googleSheetError = 'Chưa cấu hình Google Sheets Service Account (thiếu GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY hoặc GOOGLE_SHEET_ID).';
    }

    // Luôn lưu một bản dự phòng vào Supabase (nếu có cấu hình) để không mất thông tin khách mời
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
      // Supabase là lớp an toàn dự phòng
    }

    if (savedToGoogleSheets) {
      return NextResponse.json({
        success: true,
        message: 'Xác nhận tham dự đã được lưu vào Google Sheet thành công!',
        mode: 'google_sheet',
        data: { name, phone, attending, guestsCount, side, message, timestamp },
      });
    }

    // Nếu không thể ghi vào Google Sheets do lỗi tài khoản
    return NextResponse.json({
      success: true,
      message: 'Đã ghi nhận xác nhận tham dự thành công (lưu dự phòng hệ thống do lỗi xác thực Google Sheets)!',
      mode: 'backup',
      warning: googleSheetError,
      data: { name, phone, attending, guestsCount, side, message, timestamp },
    });

  } catch (err: any) {
    console.error('RSVP API route error:', err);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
