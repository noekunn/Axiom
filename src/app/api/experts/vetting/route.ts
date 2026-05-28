import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { ExpertTier } from '@prisma/client';

const vettingSchema = z.object({
  expertId: z.string().uuid('Invalid Expert ID format'),
  challengeId: z.string().min(1, 'Challenge ID cannot be empty'),
  score: z.number().min(0, 'Score must be at least 0').max(100, 'Score cannot exceed 100'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = vettingSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    const { expertId, challengeId, score } = result.data;
    
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
    
    const passed = score >= 80;
    let upgradedTier: ExpertTier = existingProfile.tier;
    
    if (passed) {
      if (score >= 95) {
        upgradedTier = ExpertTier.ELITE;
      } else if (score >= 90) {
        upgradedTier = ExpertTier.SENIOR;
      } else if (score >= 85) {
        upgradedTier = ExpertTier.GOLD;
      } else {
        upgradedTier = ExpertTier.SILVER;
      }
    }
    
    // If the tier has changed, update it
    let updatedProfile = existingProfile;
    if (upgradedTier !== existingProfile.tier) {
      updatedProfile = await prisma.expertProfile.update({
        where: { id: expertId },
        data: { tier: upgradedTier },
      });
    }
    
    return NextResponse.json({
      message: passed 
        ? `Congratulations! You passed the vetting challenge ${challengeId}!` 
        : `Vetting challenge ${challengeId} completed. Score did not meet the passing criteria.`,
      score,
      passed,
      previousTier: existingProfile.tier,
      currentTier: updatedProfile.tier,
      expertProfile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error in expert vetting:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
