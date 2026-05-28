import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { TaskStatus, ConsensusStatus } from '@prisma/client';

const claimSchema = z.object({
  taskId: z.string().uuid('Invalid Task ID format'),
  expertId: z.string().uuid('Invalid Expert ID format'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = claimSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    const { taskId, expertId } = result.data;
    
    // Verify expert profile exists
    const expert = await prisma.expertProfile.findUnique({
      where: { id: expertId },
    });
    
    if (!expert) {
      return NextResponse.json(
        { error: 'Not Found', message: `Expert with ID ${expertId} does not exist.` },
        { status: 404 }
      );
    }
    
    // Verify task exists and is active
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assetPool: true },
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Not Found', message: `Task with ID ${taskId} does not exist.` },
        { status: 404 }
      );
    }
    
    if (task.status !== TaskStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Bad Request', message: `Task is not active. Status: ${task.status}` },
        { status: 400 }
      );
    }
    
    // Check for existing submissions on this task
    const existingSubmissions = await prisma.taskSubmission.findMany({
      where: { taskId },
    });
    
    // 1. Check if anyone has an approved submission (task is fully completed)
    const approvedSubmission = existingSubmissions.find(
      (sub) => sub.consensusStatus === ConsensusStatus.APPROVED
    );
    if (approvedSubmission) {
      return NextResponse.json(
        { error: 'Conflict', message: 'This task has already been completed and approved by an expert.' },
        { status: 409 }
      );
    }
    
    // 2. Check if this exact expert already has a claim
    const expertClaim = existingSubmissions.find((sub) => sub.expertId === expertId);
    if (expertClaim) {
      return NextResponse.json({
        message: 'You have already claimed this task. You can submit your work using this submission ID.',
        submission: expertClaim,
        isNewClaim: false,
      });
    }
    
    // 3. Check if someone else currently claims it (i.e. has a PENDING submission)
    const activeClaim = existingSubmissions.find(
      (sub) => sub.consensusStatus === ConsensusStatus.PENDING
    );
    if (activeClaim) {
      return NextResponse.json(
        { error: 'Conflict', message: 'This task is currently claimed by another expert.' },
        { status: 409 }
      );
    }
    
    // Create new claim (TaskSubmission in PENDING state with default values)
    const newClaim = await prisma.taskSubmission.create({
      data: {
        taskId,
        expertId,
        content: 'CLAIMED_IN_PROGRESS',
        consensusStatus: ConsensusStatus.PENDING,
        qualityMultiplierApplied: 1.0,
        pointsEarned: 0.0,
      },
    });
    
    return NextResponse.json(
      {
        message: 'Task successfully claimed. The claim lock is now active.',
        submission: newClaim,
        isNewClaim: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in task claiming:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
