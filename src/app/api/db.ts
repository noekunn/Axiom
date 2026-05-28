// Simulated in-memory database to preserve state during development dev-server lifecycle
// Prevents hot-reloading from clearing state by binding to globalThis

export interface Expert {
  id: string;
  name: string;
  email: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'SENIOR' | 'ELITE';
  upiId: string;
  points: number;
  totalEarnings: number; // in INR
  razorpayStatus: 'CONNECTED' | 'PENDING' | 'NOT_CONNECTED';
}

export interface AssetPool {
  id: string;
  title: string;
  description: string;
  category: string;
  totalPoints: number;
  basePrice: number; // USD Standard Shared License
  exclusivePrice: number; // USD Exclusive Buyout License
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  licenseCount: number;
  languages: string[];
  samplePrompt: string;
}

export interface TaskSubmission {
  id: string;
  expertId: string;
  expertName: string;
  expertTier: string;
  poolId: string;
  poolTitle: string;
  prompt: string;
  response: string;
  difficultyMultiplier: number;
  qualityScore?: number;
  pointsEarned?: number;
  status: 'PENDING' | 'APPROVED' | 'BORDERLINE' | 'REJECTED' | 'HUMAN_REVIEW_REQUIRED';
  timestamp: string;
  evaluations?: Array<{
    provider: string;
    modelName: string;
    score: number;
    verdict: 'APPROVED' | 'BORDERLINE' | 'REJECTED';
    reasoning: string;
  }>;
}

export interface RoyaltyPayout {
  id: string;
  expertId: string;
  expertName: string;
  poolId: string;
  poolTitle: string;
  licenseType: 'SHARED' | 'EXCLUSIVE';
  grossRoyalty: number; // in INR (representing pro-rata share of the 5% Pool license fee, converted roughly at $1 = ₹83)
  netRoyalty: number; // after network and Razorpay payout fee (INR)
  timestamp: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  payoutTransactionId: string;
}

export interface Client {
  id: string;
  companyName: string;
  email: string;
  llmSize: string;
  stripeBilling: string;
  datasetNeeds: string;
}

class SimulatedDatabase {
  public experts: Expert[] = [];
  public pools: AssetPool[] = [];
  public submissions: TaskSubmission[] = [];
  public royaltyLedger: RoyaltyPayout[] = [];
  public clients: Client[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    this.experts = [
      {
        id: 'exp_ananya',
        name: 'Dr. Ananya Iyer',
        email: 'ananya.iyer@axiom.ai',
        tier: 'GOLD',
        upiId: 'ananya.iyer@okaxis',
        points: 320,
        totalEarnings: 48500,
        razorpayStatus: 'CONNECTED',
      },
      {
        id: 'exp_rahul',
        name: 'Adv. Rahul Banerjee',
        email: 'rahul.banerjee@axiom.ai',
        tier: 'SENIOR',
        upiId: 'rahul.banerjee@okicici',
        points: 210,
        totalEarnings: 31200,
        razorpayStatus: 'CONNECTED',
      },
      {
        id: 'exp_priya',
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@axiom.ai',
        tier: 'ELITE',
        upiId: 'priyasharma@okhdfc',
        points: 450,
        totalEarnings: 82100,
        razorpayStatus: 'CONNECTED',
      }
    ];

    this.pools = [
      {
        id: 'pool_hinglish_clinical',
        title: 'Axiom-Hinglish-Clinical-V1',
        description: 'High-fidelity clinical communication & diagnostic reasoning instructions in code-mixed Hindi-English (Hinglish). Built with credentialed Indian physicians.',
        category: 'Healthcare',
        totalPoints: 980,
        basePrice: 25000,
        exclusivePrice: 87500,
        status: 'ACTIVE',
        licenseCount: 3,
        languages: ['Hindi', 'English', 'Hinglish'],
        samplePrompt: 'Patient complaints of persistent dry cough but says: "Dr, mujhe chest me halki jakdan (tightness) feel hoti hai, aur saas lene me thodi difficulty ho rahi hai, specifically jab main seedhi (stairs) chadhta hu."'
      },
      {
        id: 'pool_bilingual_legal',
        title: 'Axiom-Bilingual-Legal-V1',
        description: 'Complex corporate compliance, regional contract dispute resolution, and statutory analysis in code-mixed Bengali-English and Hindi-English.',
        category: 'Legal',
        totalPoints: 680,
        basePrice: 35000,
        exclusivePrice: 122500,
        status: 'ACTIVE',
        licenseCount: 1,
        languages: ['Bengali', 'Hindi', 'English'],
        samplePrompt: 'Draft an arbitration waiver clause that accommodates West Bengal local industrial arbitration rules while retaining validity under national contract law.'
      },
      {
        id: 'pool_indic_cardiology',
        title: 'Axiom-Indic-Cardiology-V1',
        description: 'Specialized diagnostic datasets covering cardiac diagnostics, ECG interpretations, and emergency counseling protocols in Tamil, Telugu, and English.',
        category: 'Healthcare',
        totalPoints: 450,
        basePrice: 48000,
        exclusivePrice: 168000,
        status: 'ACTIVE',
        licenseCount: 0,
        languages: ['Tamil', 'Telugu', 'English'],
        samplePrompt: 'Explain how to counsel a patient showing acute ST-elevation myocardial infarction (STEMI) symptoms in high-speed Tamil medical slang vs formal clinical Telugu.'
      }
    ];

    // Seed recent submissions
    this.submissions = [
      {
        id: 'sub_1',
        expertId: 'exp_ananya',
        expertName: 'Dr. Ananya Iyer',
        expertTier: 'GOLD',
        poolId: 'pool_hinglish_clinical',
        poolTitle: 'Axiom-Hinglish-Clinical-V1',
        prompt: 'How would you explain hypertension medication adherence to an elderly patient in Hinglish?',
        response: 'Dekhiye Dadi, aapki bp ki goli (amlodipine) rojana subah khali pet lena bohot zaroori hai. Aisa nahi ki jab sir ghumne lage tabhi goli khayein. BP ek silent killer hai, isko control me rakhne ke liye constant blood levels chahiye. Agar aap goli miss karengi toh rebound hypertension ka risk badhta hai jo dil ke liye thik nahi hai.',
        difficultyMultiplier: 1.2,
        qualityScore: 94,
        pointsEarned: 13.5,
        status: 'APPROVED',
        timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
        evaluations: [
          { provider: 'Llama 3.3 (Groq)', modelName: 'llama-3.3-70b-versatile', score: 95, verdict: 'APPROVED', reasoning: 'Excellent Hinglish vocabulary, accurate clinical advice, and high patient accessibility.' },
          { provider: 'Claude 3.5 Sonnet', modelName: 'claude-3-5-sonnet-20241022', score: 93, verdict: 'APPROVED', reasoning: 'Meets all instruction-following metrics. Safe, empathetic, and culturally calibrated.' }
        ]
      },
      {
        id: 'sub_2',
        expertId: 'exp_rahul',
        expertName: 'Adv. Rahul Banerjee',
        expertTier: 'SENIOR',
        poolId: 'pool_bilingual_legal',
        poolTitle: 'Axiom-Bilingual-Legal-V1',
        prompt: 'Analyze the enforceability of oral tenancy agreements under regional West Bengal law in English.',
        response: 'Under the West Bengal Premises Tenancy Act 1997, oral agreements hold negligible evidentiary weight. Section 4 mandates that all tenancies entered after the commencement of this Act must be in writing and registered. Therefore, an oral tenancy is legally vulnerable, though under general Indian Contract Act principles, part performance can sometimes be argued in equity under Section 53A of the Transfer of Property Act.',
        difficultyMultiplier: 1.5,
        qualityScore: 96,
        pointsEarned: 22.5,
        status: 'APPROVED',
        timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
        evaluations: [
          { provider: 'Llama 3.3 (Groq)', modelName: 'llama-3.3-70b-versatile', score: 97, verdict: 'APPROVED', reasoning: 'Extremely detailed legal references to specific sections of West Bengal state tenancy acts.' },
          { provider: 'Claude 3.5 Sonnet', modelName: 'claude-3-5-sonnet-20241022', score: 95, verdict: 'APPROVED', reasoning: 'Rigorous legal logic, robust citations, and perfect professional tone.' }
        ]
      }
    ];

    // Seed historical royalty ledger
    this.royaltyLedger = [
      {
        id: 'payout_1',
        expertId: 'exp_ananya',
        expertName: 'Dr. Ananya Iyer',
        poolId: 'pool_hinglish_clinical',
        poolTitle: 'Axiom-Hinglish-Clinical-V1',
        licenseType: 'SHARED',
        grossRoyalty: 25937, // ₹25,937 INR royalty
        netRoyalty: 25418, // after Razorpay/transfer fees
        timestamp: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        status: 'SUCCESS',
        payoutTransactionId: 'payout_rzp_trn_9a87d65b12'
      },
      {
        id: 'payout_2',
        expertId: 'exp_priya',
        expertName: 'Dr. Priya Sharma',
        poolId: 'pool_hinglish_clinical',
        poolTitle: 'Axiom-Hinglish-Clinical-V1',
        licenseType: 'SHARED',
        grossRoyalty: 36470,
        netRoyalty: 35740,
        timestamp: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        status: 'SUCCESS',
        payoutTransactionId: 'payout_rzp_trn_8e27c15f92'
      },
      {
        id: 'payout_3',
        expertId: 'exp_rahul',
        expertName: 'Adv. Rahul Banerjee',
        poolId: 'pool_bilingual_legal',
        poolTitle: 'Axiom-Bilingual-Legal-V1',
        licenseType: 'SHARED',
        grossRoyalty: 29800,
        netRoyalty: 29204,
        timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        status: 'SUCCESS',
        payoutTransactionId: 'payout_rzp_trn_2b18e7cfa5'
      }
    ];
  }
}

// Ensure global database singleton to handle hot-reloads
const globalForDb = globalThis as unknown as {
  db: SimulatedDatabase | undefined;
};

export const db = globalForDb.db ?? new SimulatedDatabase();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}
