import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
  }

  try {
    const response = await fetch(`${targetUrl}/api/ocpp/stations`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`External API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch upstream data' }, { status: 502 });
  }
}
