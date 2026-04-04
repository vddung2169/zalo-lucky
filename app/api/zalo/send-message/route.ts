import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

/**
 * Zalo Token Keys for KV Storage
 */
const KV_ACCESS_KEY = 'zalo_oa_access_token';
const KV_REFRESH_KEY = 'zalo_oa_refresh_token';

/**
 * Helper to get current tokens (KV first, then .env)
 */
async function getTokens() {
  const access = await kv.get<string>(KV_ACCESS_KEY);
  const refresh = await kv.get<string>(KV_REFRESH_KEY);

  return { 
    access: (access || process.env.ZALO_OA_ACCESS_TOKEN || '').trim(), 
    refresh: (refresh || process.env.ZALO_OA_REFRESH_TOKEN || '').trim() 
  };
}

/**
 * Helper to refresh Zalo OA Access Token using Refresh Token (v4)
 * Docs: https://developers.zalo.me/docs/official-account/bat-dau/xac-thuc-va-uy-quyen-v4
 */
async function refreshZaloToken(currentRefreshToken: string) {
  const appId = process.env.ZALO_APP_ID;
  const appSecret = process.env.ZALO_APP_SECRET;

  if (!appId || !appSecret || !currentRefreshToken) {
    console.error('[Zalo OA] Refresh FAILED: Missing Credentials or Refresh Token');
    return null;
  }

  try {
    console.log('[Zalo OA] Refreshing access token via oauth.zaloapp.com...');
    const response = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'secret_key': appSecret,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        app_id: appId,
        refresh_token: currentRefreshToken,
      }),
    });

    const data = await response.json();
    console.log('[Zalo OA] Refresh Response:', data);

    if (data.access_token) {
      console.log('✅ TOKEN REFRESH SUCCESSFUL!');
      
      // PERSIST TO KV for production durability
      try {
        await kv.set(KV_ACCESS_KEY, data.access_token);
        await kv.set(KV_REFRESH_KEY, data.refresh_token);
        console.log('[Zalo OA] Tokens saved to persistent storage (KV)');
      } catch (kvErr) {
        console.warn('[Zalo OA] KV Storage failed, tokens only in memory for this request', kvErr);
      }

      return data.access_token;
    } else {
      console.error('[Zalo OA] Token refresh failed with data:', data);
      return null;
    }
  } catch (err) {
    console.error('[Zalo OA] Fatal error during token refresh:', err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, value, code } = body;

    // Load latest tokens from KV or ENV
    const tokens = await getTokens();
    let accessToken = tokens.access;

    const sendMessage = async (token: string) => {
      const message = `Chúc mừng bạn! Bạn đã trúng Voucher trị giá ${value.toLocaleString('vi-VN')}đ từ chương trình Vòng Quay May Mắn.
Mã ưu đãi của bạn: ${code}

Vui lòng đưa mã này cho nhân viên cửa hàng để được áp dụng. Chúc bạn một ngày tốt lành!`;

      console.log(`[Zalo OA] Sending to recipient: ${phone} using token: ${token.substring(0, 10)}...`);

      return fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': token,
        },
        body: JSON.stringify({
          recipient: { user_id: phone },
          message: { text: message },
        }),
      });
    };

    // Attempt 1
    let zaloResponse = await sendMessage(accessToken);
    let result = await zaloResponse.json();
    console.log('[Zalo OA] Attempt 1 Result:', result);

    // If token is invalid or expired
    if (result.error === -216 || result.message?.toLowerCase().includes('access token is invalid')) {
      console.warn('[Zalo OA] Access token is invalid. Attempting REFRESH...');
      const newToken = await refreshZaloToken(tokens.refresh);
      if (newToken) {
        accessToken = newToken;
        // Attempt 2
        console.log('[Zalo OA] Retrying message delivery with NEW token...');
        zaloResponse = await sendMessage(accessToken);
        result = await zaloResponse.json();
        console.log('[Zalo OA] Attempt 2 Result:', result);
      } else {
        console.error('[Zalo OA] Refresh logic failed to obtain a new token.');
        return NextResponse.json({ 
          success: false, 
          error: 'Refresh Token failed or is missing credentials.',
          prize: { value, code }
        });
      }
    }

    return NextResponse.json({ 
      success: result.error === 0, 
      error_code: result.error,
      zalo_message: result.message || 'Không thể gửi tin nhắn qua Zalo OA',
      prize: { value, code }
    });
  } catch (error) {
    console.error('[Zalo OA] Exception in API route:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

