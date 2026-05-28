import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { ExpertTier } from '@prisma/client';

const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

const onboardSchema = z.object({
  expertId: z.string().uuid('Invalid Expert ID format'),
  upiId: z.string().regex(upiRegex, 'Invalid UPI VPA format (e.g., username@bank)').optional(),
  razorpayContactId: z.string().min(1, 'Contact ID cannot be empty').optional(),
  razorpayFundAccountId: z.string().min(1, 'Fund Account ID cannot be empty').optional(),
  tier: z.nativeEnum(ExpertTier).optional(),
});

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = onboardSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    const { expertId, upiId, razorpayContactId, razorpayFundAccountId, tier } = result.data;
    
    // Check if ExpertProfile exists
    const existingProfile = await prisma.expertProfile.findUnique({
      where: { id: expertId },
    });
    
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Not Found', message: `Expert Profile with ID ${expertId} does not exist.` },
        { status: 404 }
      );
    }
    
    // Update data
    const updatedProfile = await prisma.expertProfile.update({
      where: { id: expertId },
      data: {
        ...(upiId !== undefined && { upiId }),
        ...(razorpayContactId !== undefined && { razorpayContactId }),
        ...(razorpayFundAccountId !== undefined && { razorpayFundAccountId }),
        ...(tier !== undefined && { tier }),
      },
    });
    
    return NextResponse.json({
      message: 'Expert onboarding details updated successfully.',
      expertProfile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error in expert onboarding update:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
