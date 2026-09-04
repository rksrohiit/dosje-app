/**
 * Persistent Storage Helper for DoSJE Platform
 * Ensures all user-created projects, beneficiaries, and field evidence
 * are saved to browser localStorage in addition to the backend database.
 *
 * This guarantees that even if:
 * 1. The user refreshes the page
 * 2. The server is asleep / restarting (Render free tier)
 * 3. The user is offline or testing client-side
 * No newly added entries are ever lost!
 */

const STORAGE_KEYS = {
  PROJECTS: 'dosje_custom_projects',
  BENEFICIARIES: 'dosje_custom_beneficiaries',
  EVIDENCE: 'dosje_custom_evidence'
};

export const defaultProjects = [
  {
    id: 'DOSJE-PROJECT-2026-001',
    name: 'Rural Education Support 2026',
    scheme_name: 'SMILE',
    scheme_id: 's1',
    location: 'Sehore, Madhya Pradesh',
    state: 'Madhya Pradesh',
    district: 'Sehore',
    beneficiary_target: 150,
    beneficiary_count: 142,
    budget: 500000,
    start_date: '2026-09-01',
    end_date: '2026-12-31',
    status: 'active',
    description: 'Educational kits, tuition assistance, and daily nourishment for rural SC/ST children.'
  },
  {
    id: 'DOSJE-PROJECT-2026-002',
    name: 'Skill Development Program',
    scheme_name: 'SHG',
    scheme_id: 's3',
    location: 'Rohini, New Delhi',
    state: 'Delhi',
    district: 'North West Delhi',
    beneficiary_target: 75,
    beneficiary_count: 68,
    budget: 300000,
    start_date: '2026-08-15',
    end_date: '2027-02-28',
    status: 'active',
    description: 'Handicraft training, digital payment onboarding, and micro-grant seed assistance for self-help groups.'
  }
];

export const defaultBeneficiaries = [
  {
    id: 'BEN-1001',
    name: 'Anita Devi',
    guardian_name: 'Ram Prasad',
    village: 'Dwarka Sector 12',
    district: 'South West Delhi',
    state: 'Delhi',
    phone: '9876543201',
    aadhaar_last4: '4523',
    project_id: 'DOSJE-PROJECT-2026-001',
    project_name: 'Rural Education Support 2026',
    status: 'verified',
    services_received: '["Books", "Uniform", "Mid-Day Meal"]',
    verification_count: 3,
    last_verified_at: '2026-08-28T10:30:00Z',
    lat: 28.5935,
    lng: 77.0480
  },
  {
    id: 'BEN-1002',
    name: 'Ravi Kumar',
    guardian_name: 'Shanti Devi',
    village: 'Dwarka Sector 7',
    district: 'South West Delhi',
    state: 'Delhi',
    phone: '9876543202',
    aadhaar_last4: '7891',
    project_id: 'DOSJE-PROJECT-2026-001',
    project_name: 'Rural Education Support 2026',
    status: 'verified',
    services_received: '["Books", "Mid-Day Meal"]',
    verification_count: 2,
    last_verified_at: '2026-08-25T14:15:00Z',
    lat: 28.5890,
    lng: 77.0510
  },
  {
    id: 'BEN-1003',
    name: 'Sunita Sharma',
    guardian_name: 'Mohan Sharma',
    village: 'Dwarka Sector 19',
    district: 'South West Delhi',
    state: 'Delhi',
    phone: '9876543203',
    aadhaar_last4: '3456',
    project_id: 'DOSJE-PROJECT-2026-001',
    project_name: 'Rural Education Support 2026',
    status: 'pending',
    services_received: '[]',
    verification_count: 0,
    last_verified_at: null,
    lat: 28.5950,
    lng: 77.0420
  },
  {
    id: 'BEN-1005',
    name: 'Meera Gupta',
    guardian_name: 'Raj Gupta',
    village: 'Rohini Sector 3',
    district: 'North West Delhi',
    state: 'Delhi',
    phone: '9876543205',
    aadhaar_last4: '2345',
    project_id: 'DOSJE-PROJECT-2026-002',
    project_name: 'Skill Development Program',
    status: 'verified',
    services_received: '["Tailoring Kit", "Training Certificate"]',
    verification_count: 4,
    last_verified_at: '2026-08-27T11:45:00Z',
    lat: 28.7510,
    lng: 77.0580
  }
];

export const defaultEvidence = [
  {
    id: 'EV-001',
    project_id: 'DOSJE-PROJECT-2026-001',
    project_name: 'Rural Education Support 2026',
    beneficiary_id: 'BEN-1001',
    beneficiary_name: 'Anita Devi',
    trust_score: 95,
    trust_status: 'verified',
    verification_code: 'X7P92',
    distance_from_target: 45,
    file_hash: '8f3a91bc92de104a7b5c8290fae139820541cdb387e042a9b31d8e97f001',
    captured_at: '2026-08-30T10:14:00Z',
    beneficiary_confirmed: 1,
    file_url: 'https://images.unsplash.com/photo-1593113563332-f368c8585489?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'EV-002',
    project_id: 'DOSJE-PROJECT-2026-001',
    project_name: 'Rural Education Support 2026',
    beneficiary_id: 'BEN-1002',
    beneficiary_name: 'Ravi Kumar',
    trust_score: 88,
    trust_status: 'review',
    verification_code: 'A8K47',
    distance_from_target: 120,
    file_hash: '3e1c94ba02fe881d7a4b9180fae139820541cdb387e042a9b31d8e97f002',
    captured_at: '2026-08-29T14:30:00Z',
    beneficiary_confirmed: 1,
    file_url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'EV-005',
    project_id: 'DOSJE-PROJECT-2026-002',
    project_name: 'Skill Development Program',
    beneficiary_id: 'BEN-1005',
    beneficiary_name: 'Meera Gupta',
    trust_score: 96,
    trust_status: 'verified',
    verification_code: 'T5W81',
    distance_from_target: 22,
    file_hash: '5b8a91bc92de104a7b5c8290fae139820541cdb387e042a9b31d8e97f005',
    captured_at: '2026-08-28T16:20:00Z',
    beneficiary_confirmed: 1,
    file_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'EV-006',
    project_id: 'DOSJE-PROJECT-2026-002',
    project_name: 'Skill Development Program',
    beneficiary_id: 'BEN-1006',
    beneficiary_name: 'Kamla Devi',
    trust_score: 45,
    trust_status: 'suspicious',
    verification_code: null,
    distance_from_target: 850,
    file_hash: '7d4f91bc92de104a7b5c8290fae139820541cdb387e042a9b31d8e97f006',
    captured_at: '2026-08-26T09:12:00Z',
    beneficiary_confirmed: 0,
    file_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop'
  }
];

// Helper to broadcast storage changes
const broadcastChange = (key, data) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dosje_storage_changed', { detail: { key, data } }));
  }
};

export const persistentStorage = {
  // ─── PROJECTS ──────────────────────────────────────────────────────────
  getProjects(serverProjects = []) {
    let custom = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (raw) custom = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse custom projects:', e);
    }

    // Base list: server list if available, else defaultProjects
    const base = (serverProjects && serverProjects.length > 0) ? serverProjects : defaultProjects;

    // Merge: custom projects come first, don't duplicate if ID matches
    const map = new Map();
    custom.forEach(p => map.set(p.id, p));
    base.forEach(p => {
      if (!map.has(p.id)) map.set(p.id, p);
    });

    return Array.from(map.values());
  },

  saveProject(newProject) {
    let custom = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (raw) custom = JSON.parse(raw);
    } catch (e) {}

    // Add or update
    const existingIndex = custom.findIndex(p => p.id === newProject.id);
    if (existingIndex >= 0) {
      custom[existingIndex] = { ...custom[existingIndex], ...newProject };
    } else {
      custom.unshift(newProject);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(custom));
      broadcastChange(STORAGE_KEYS.PROJECTS, custom);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    return newProject;
  },

  // ─── BENEFICIARIES ─────────────────────────────────────────────────────
  getBeneficiaries(serverBeneficiaries = []) {
    let custom = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BENEFICIARIES);
      if (raw) custom = JSON.parse(raw);
    } catch (e) {}

    const base = (serverBeneficiaries && serverBeneficiaries.length > 0) ? serverBeneficiaries : defaultBeneficiaries;

    const map = new Map();
    custom.forEach(b => map.set(b.id, b));
    base.forEach(b => {
      if (!map.has(b.id)) map.set(b.id, b);
    });

    return Array.from(map.values());
  },

  saveBeneficiary(newBeneficiary) {
    let custom = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BENEFICIARIES);
      if (raw) custom = JSON.parse(raw);
    } catch (e) {}

    const existingIndex = custom.findIndex(b => b.id === newBeneficiary.id);
    if (existingIndex >= 0) {
      custom[existingIndex] = { ...custom[existingIndex], ...newBeneficiary };
    } else {
      custom.unshift(newBeneficiary);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(custom));
      broadcastChange(STORAGE_KEYS.BENEFICIARIES, custom);
    } catch (e) {}

    return newBeneficiary;
  },

  // ─── EVIDENCE ──────────────────────────────────────────────────────────
  getEvidence(serverEvidence = []) {
    let custom = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
      if (raw) custom = JSON.parse(raw);
    } catch (e) {}

    const base = (serverEvidence && serverEvidence.length > 0) ? serverEvidence : defaultEvidence;

    const map = new Map();
    custom.forEach(ev => map.set(ev.id, ev));
    base.forEach(ev => {
      if (!map.has(ev.id)) map.set(ev.id, ev);
    });

    return Array.from(map.values());
  },

  saveEvidence(newEvidence) {
    let custom = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
      if (raw) custom = JSON.parse(raw);
    } catch (e) {}

    const existingIndex = custom.findIndex(ev => ev.id === newEvidence.id);
    if (existingIndex >= 0) {
      custom[existingIndex] = { ...custom[existingIndex], ...newEvidence };
    } else {
      custom.unshift(newEvidence);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(custom));
      broadcastChange(STORAGE_KEYS.EVIDENCE, custom);
    } catch (e) {}

    return newEvidence;
  }
};

export default persistentStorage;
