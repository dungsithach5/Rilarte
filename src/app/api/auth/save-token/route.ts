import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user data from backend
    const userResponse = await fetch(`http://localhost:5001/api/users/email/${session.user.email}`);
    
    if (!userResponse.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = await userResponse.json();
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: userData.user.id, 
        email: userData.user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    return NextResponse.json({ 
      token,
      message: 'Token saved successfully. You can now use like functionality.'
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 