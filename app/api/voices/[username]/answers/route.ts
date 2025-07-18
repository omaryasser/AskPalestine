import { NextRequest, NextResponse } from 'next/server';
import { getAnswersByAuthor } from '../../../../../lib/database';

interface RouteParams {
  params: Promise<{ username: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params;
    const decodedUsername = decodeURIComponent(username);
    const answers = getAnswersByAuthor(decodedUsername);
    
    return NextResponse.json({ answers });
  } catch (error) {
    console.error('Answers by author API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
