import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Gọi API backend để lấy thông tin user mới nhất
    const response = await fetch(`http://localhost:5001/api/users/email/${email}`);
    
    if (response.ok) {
      const userData = await response.json();
      console.log('Refreshed user data:', userData);
      
      return NextResponse.json({ 
        success: true, 
        user: userData.user 
      });
    } else {
      return NextResponse.json({ error: 'Failed to get user data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Refresh session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 