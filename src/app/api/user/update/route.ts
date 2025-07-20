import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, gender, password } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    if (gender && !['male', 'female'].includes(gender)) {
      return NextResponse.json(
        { success: false, message: 'Invalid gender value' },
        { status: 400 }
      );
    }

    // Call backend API to update user
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5001'}/api/users/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        gender,
        password
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to update user' },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 