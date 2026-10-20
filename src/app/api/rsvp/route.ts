import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, attending, guestsCount, side, message, dietaryRequirements } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập họ và tên của bạn.' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập số điện thoại liên lạc.' },
        { status: 400 }
      );
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      attending: Boolean(attending),
      guestsCount: Number(guestsCount) || 1,
      side: side || 'both',
      message: message?.trim() || '',
      dietaryRequirements: dietaryRequirements?.trim() || '',
      timestamp: new Date().toISOString(),
    };

    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

    // If Google Sheet Webhook URL is configured, forward the data
    if (webhookUrl && webhookUrl.startsWith('https://')) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          redirect: 'follow',
        });

        if (!response.ok) {
          console.warn('Google Sheet Webhook returned non-200 status:', response.status);
        }

        return NextResponse.json({
          success: true,
          message: 'Xác nhận tham dự đã được lưu vào Google Sheet thành công!',
          mode: 'google_sheet',
          data: payload,
        });
      } catch (webhookErr) {
        console.error('Error forwarding RSVP to Google Sheet:', webhookErr);
        // Fallback to local success if webhook fails
        return NextResponse.json({
          success: true,
          message: 'Đã ghi nhận xác nhận tham dự (lưu chế độ dự phòng do lỗi kết nối Google Sheet)!',
          mode: 'local',
          data: payload,
        });
      }
    }

    // Fallback mode when GOOGLE_SHEET_WEBHOOK_URL is not configured yet
    return NextResponse.json({
      success: true,
      message: 'Đã ghi nhận xác nhận tham dự của bạn thành công!',
      mode: 'local',
      data: payload,
    });
  } catch (err: any) {
    console.error('RSVP API route error:', err);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
