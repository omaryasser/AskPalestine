import { NextResponse } from 'next/server';
import { getTotalCounts } from '../../../../lib/database';

export async function GET() {
  try {
    const counts = getTotalCounts();
    
    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
