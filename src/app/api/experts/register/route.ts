import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { UserRole } from '@prisma/client';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    // Check if user already exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: { expertProfile: true },
    });
    
    if (user) {
      if (user.role !== UserRole.EXPERT) {
        return NextResponse.json(
          { error: 'Unauthorized: This email is registered under a different role.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json({
        message: 'Welcome back! Magic link sent to your email (simulated).',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        expertProfile: user.expertProfile,
        isNewUser: false,
      });
    }
    
    // Create new expert user and profile in a transaction
    const newExpert = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          role: UserRole.EXPERT,
        },
      });
      
      const newProfile = await tx.expertProfile.create({
        data: {
          userId: newUser.id,
          tier: 'BRONZE',
        },
      });
      
      return {
        user: newUser,
        profile: newProfile,
      };
    });
    
    return NextResponse.json(
      {
        message: 'Registration successful! Magic link sent to your email (simulated).',
        user: {
          id: newExpert.user.id,
          email: newExpert.user.email,
          role: newExpert.user.role,
        },
        expertProfile: newExpert.profile,
        isNewUser: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in expert registration:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
