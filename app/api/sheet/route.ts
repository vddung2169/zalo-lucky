import { NextResponse } from 'next/server';

const GOOGLE_SHEET_API = 'https://script.google.com/macros/s/AKfycbwGMVJ2krlM72_35b6m8GTMKet_z2T83g1-6D-MJInZ93rLRNByG0T75j6UWj6AnDlc/exec';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Proxy the request to Google Sheets API to avoid CORS issues
    const response = await fetch(GOOGLE_SHEET_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      redirect: 'follow', // Necessary for Google Apps Script redirects
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying sheet request:', error);
    return NextResponse.json({ error: 'Failed to communicate with Google Sheets' }, { status: 500 });
  }
}
