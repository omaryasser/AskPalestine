import { NextRequest, NextResponse } from 'next/server';
import { getQuestion } from '../../../../lib/database';

interface RouteParams {
  params: Promise<{ question: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { question } = await params;
    const questionId = decodeURIComponent(question);
    const questionData = getQuestion(questionId);
    
    if (!questionData) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    return NextResponse.json({ question: questionData });
  } catch (error) {
    console.error('Question API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
