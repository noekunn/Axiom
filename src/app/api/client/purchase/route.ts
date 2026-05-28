import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { db as mockDb } from '../../db'; // simulated database
import { LicenseType, LicenseStatus, PayoutStatus, PaymentProvider } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { poolId, licenseType, buyerEmail } = body;

    if (!poolId || !licenseType || !buyerEmail) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    let dbConnected = true;
    let poolName = "";
    let poolTotalPoints = 100;

    // 1. Try to ensure the pool and license are created in Prisma (fail-safe)
    try {
      let pool = await prisma.assetPool.findUnique({
        where: { id: poolId }
      });

      if (!pool) {
        const mockPool = mockDb.pools.find(p => p.id === poolId);
        if (mockPool) {
          pool = await prisma.assetPool.create({
            data: {
              id: mockPool.id,
              name: mockPool.title,
              description: mockPool.description,
              domain: mockPool.category,
              language: mockPool.languages.join(', '),
              version: 'V1',
              status: mockPool.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE',
              totalPoints: mockPool.totalPoints,
              basePrice: mockPool.basePrice,
              exclusivePrice: mockPool.exclusivePrice,
            }
          });
        }
      }

      if (pool) {
        poolName = pool.name;
        poolTotalPoints = pool.totalPoints > 0 ? Number(pool.totalPoints) : 100;
        
        let user = await prisma.user.findUnique({
          where: { email: buyerEmail }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: buyerEmail,
              role: 'CLIENT',
              name: buyerEmail.split('@')[0],
            }
          });
        }

        let clientProfile = await prisma.clientProfile.findUnique({
          where: { userId: user.id }
        });

        if (!clientProfile) {
          clientProfile = await prisma.clientProfile.create({
            data: {
              userId: user.id,
              companyName: buyerEmail.split('@')[1]?.split('.')[0] || 'Enterprise Client',
            }
          });
        }

        const licenseFee = licenseType === 'EXCLUSIVE' ? pool.exclusivePrice : pool.basePrice;
        const stripeSessionId = `sess_${Math.random().toString(36).substring(2, 12)}`;
        const stripePaymentIntentId = `pi_${Math.random().toString(36).substring(2, 12)}`;

        const poolLicense = await prisma.poolLicense.create({
          data: {
            assetPoolId: pool.id,
            clientId: user.id,
            licenseType: licenseType as LicenseType,
            licenseFee: licenseFee,
            status: LicenseStatus.COMPLETED,
            stripeSessionId,
            stripePaymentIntentId,
            licensedAt: new Date(),
          }
        });

        if (licenseType === 'EXCLUSIVE') {
          await prisma.assetPool.update({
            where: { id: pool.id },
            data: { status: 'ARCHIVED' }
          });
        }

        const royaltyPoolUSD = Number(licenseFee) * 0.05;

        let contributors = await prisma.poolContribution.findMany({
          where: { assetPoolId: pool.id },
          include: { expert: { include: { user: true } } }
        });

        if (contributors.length === 0) {
          const mockSubs = mockDb.submissions.filter(s => s.poolId === pool.id && s.status === 'APPROVED');
          const mockExpertIds = Array.from(new Set(mockSubs.map(s => s.expertId)));

          for (const expId of mockExpertIds) {
            const mockExp = mockDb.experts.find(e => e.id === expId);
            if (mockExp) {
              let expUser = await prisma.user.findFirst({ where: { email: mockExp.email } });
              if (!expUser) {
                expUser = await prisma.user.create({
                  data: {
                    email: mockExp.email,
                    name: mockExp.name,
                    role: 'EXPERT',
                  }
                });
              }
              let expProfile = await prisma.expertProfile.findUnique({ where: { userId: expUser.id } });
              if (!expProfile) {
                expProfile = await prisma.expertProfile.create({
                  data: {
                    id: mockExp.id,
                    userId: expUser.id,
                    tier: mockExp.tier as any,
                    upiId: mockExp.upiId,
                    totalPoints: mockExp.points,
                    lifetimeEarnings: mockExp.totalEarnings,
                  }
                });
              }

              await prisma.poolContribution.upsert({
                where: {
                  expertId_assetPoolId: {
                    expertId: mockExp.id,
                    assetPoolId: pool.id,
                  }
                },
                update: {},
                create: {
                  expertId: mockExp.id,
                  assetPoolId: pool.id,
                  points: mockExp.points,
                  sharePercentage: mockExp.points / (mockDb.pools.find(p => p.id === pool.id)?.totalPoints || 1),
                }
              });
            }
          }

          contributors = await prisma.poolContribution.findMany({
            where: { assetPoolId: pool.id },
            include: { expert: { include: { user: true } } }
          });
        }

        if (contributors.length === 0) {
          for (const mockExp of mockDb.experts) {
            let expUser = await prisma.user.findFirst({ where: { email: mockExp.email } });
            if (!expUser) {
              expUser = await prisma.user.create({
                data: {
                  email: mockExp.email,
                  name: mockExp.name,
                  role: 'EXPERT',
                }
              });
            }
            let expProfile = await prisma.expertProfile.findUnique({ where: { userId: expUser.id } });
            if (!expProfile) {
              expProfile = await prisma.expertProfile.create({
                data: {
                  id: mockExp.id,
                  userId: expUser.id,
                  tier: mockExp.tier as any,
                  upiId: mockExp.upiId,
                  totalPoints: mockExp.points,
                  lifetimeEarnings: mockExp.totalEarnings,
                }
              });
            }

            await prisma.poolContribution.upsert({
              where: {
                expertId_assetPoolId: {
                  expertId: mockExp.id,
                  assetPoolId: pool.id,
                }
              },
              update: {},
              create: {
                expertId: mockExp.id,
                assetPoolId: pool.id,
                points: mockExp.points,
                sharePercentage: mockExp.points / mockDb.experts.reduce((acc, curr) => acc + curr.points, 0),
              }
            });
          }

          contributors = await prisma.poolContribution.findMany({
            where: { assetPoolId: pool.id },
            include: { expert: { include: { user: true } } }
          });
        }

        const calculatedPoolPoints = pool.totalPoints > 0 ? Number(pool.totalPoints) : contributors.reduce((acc, curr) => acc + curr.points, 0) || 1;

        for (const contrib of contributors) {
          const expertSharePercentage = contrib.points / calculatedPoolPoints;
          const grossRoyaltyUSD = royaltyPoolUSD * expertSharePercentage;
          const netRoyaltyUSD = grossRoyaltyUSD * 0.98;

          await prisma.expertProfile.update({
            where: { id: contrib.expertId },
            data: {
              lifetimeEarnings: { increment: grossRoyaltyUSD }
            }
          });

          await prisma.royaltyLedger.create({
            data: {
              poolLicenseId: poolLicense.id,
              assetPoolId: pool.id,
              expertId: contrib.expertId,
              pointsAtTime: contrib.points,
              totalPointsAtTime: calculatedPoolPoints,
              sharePercentageAtTime: expertSharePercentage * 100,
              grossRoyalty: grossRoyaltyUSD,
              platformFee: grossRoyaltyUSD * 0.02,
              netRoyalty: netRoyaltyUSD,
              payoutStatus: PayoutStatus.PAID,
              payoutProvider: PaymentProvider.STRIPE,
              payoutTransactionId: `st_royalty_${Math.random().toString(36).substring(2, 10)}`,
              paidAt: new Date(),
            }
          });
        }
      }
    } catch (dbError: any) {
      console.warn('[Purchase API] Database is offline or not reachable. Falling back to simulated database updates.', dbError.message);
      dbConnected = false;
    }

    // ALWAYS execute simulated database updates (fallback/sync)
    const mockPool = mockDb.pools.find(p => p.id === poolId);
    if (!mockPool) {
      return NextResponse.json({ error: 'Asset Pool not found' }, { status: 404 });
    }

    poolName = mockPool.title;
    poolTotalPoints = mockPool.totalPoints;

    if (licenseType === 'EXCLUSIVE') {
      mockPool.status = 'ARCHIVED';
    }
    mockPool.licenseCount += 1;

    const licenseFeeUSD = licenseType === 'EXCLUSIVE' ? mockPool.exclusivePrice : mockPool.basePrice;
    const royaltyPoolUSD = licenseFeeUSD * 0.05;
    const royaltyPoolINR = royaltyPoolUSD * 83;

    const mockSubs = mockDb.submissions.filter(s => s.poolId === poolId && s.status === 'APPROVED');
    const mockExpertIds = Array.from(new Set(mockSubs.map(s => s.expertId)));
    const activeContributors = mockDb.experts.filter(e => mockExpertIds.includes(e.id));
    const contributorsList = activeContributors.length > 0 ? activeContributors : mockDb.experts;

    const totalPoolPointsForMock = mockPool.totalPoints || contributorsList.reduce((acc, curr) => acc + curr.points, 0) || 1;

    for (const expert of contributorsList) {
      const expertSharePercentage = expert.points / totalPoolPointsForMock;
      const grossRoyaltyINR = parseFloat((royaltyPoolINR * expertSharePercentage).toFixed(2));
      const netRoyaltyINR = parseFloat((grossRoyaltyINR * 0.98).toFixed(2));

      expert.totalEarnings += grossRoyaltyINR;

      mockDb.royaltyLedger.push({
        id: `payout_royalty_${Math.random().toString(36).substring(2, 9)}`,
        expertId: expert.id,
        expertName: expert.name,
        poolId: mockPool.id,
        poolTitle: mockPool.title,
        licenseType: licenseType as any,
        grossRoyalty: grossRoyaltyINR,
        netRoyalty: netRoyaltyINR,
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        payoutTransactionId: `st_royalty_${Math.random().toString(36).substring(2, 10)}`
      });
    }

    const token = `r2_dl_token_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

    return NextResponse.json({
      success: true,
      message: `Licensed successfully under ${licenseType} model! ₹${royaltyPoolINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })} distributed. (Database status: ${dbConnected ? 'ONLINE' : 'OFFLINE - RUNNING MOCK FLOW'})`,
      token,
      poolTitle: poolName
    });

  } catch (error: any) {
    console.error('Error licensing dataset:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
