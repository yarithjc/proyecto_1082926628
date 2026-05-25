import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('stockcontrol_session', '', {
    path: '/',
    maxAge: 0,
  });
  return response;
}
