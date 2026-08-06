import { PROVINCES, SECTORS } from './constants';

const DISTRICT_TO_PROVINCE = {
  Kathmandu: 'Bagmati',
  Lalitpur: 'Bagmati',
  Bhaktapur: 'Bagmati',
  Chitwan: 'Bagmati',
  Hetauda: 'Bagmati',
  Pokhara: 'Gandaki',
  Kaski: 'Gandaki',
  Gorkha: 'Gandaki',
  Biratnagar: 'Koshi',
  Dharan: 'Koshi',
  Birgunj: 'Madhesh',
  Janakpur: 'Madhesh',
  Butwal: 'Lumbini',
  Nepalgunj: 'Lumbini',
  Dhangadhi: 'Sudurpashchim',
};

const DRAFT_SECTOR_TO_SIM = {
  infrastructure: 'Roads & Bridges',
  education: 'Education Infrastructure',
  health: 'Health & Nutrition',
  agriculture: 'Agriculture & Irrigation',
  development: 'Water & Sanitation',
  tourism: 'Tourism & Culture',
  budget: 'Local Governance Capacity',
  other: 'Roads & Bridges',
};

const CRORE = 10_000_000;

export function districtToProvince(district) {
  if (!district) return 'Bagmati';
  return DISTRICT_TO_PROVINCE[district] || 'Bagmati';
}

export function draftSectorToSimSector(sector) {
  if (!sector) return 'Roads & Bridges';
  return DRAFT_SECTOR_TO_SIM[sector] || 'Roads & Bridges';
}

export function nprToCrore(amount) {
  if (!amount || amount <= 0) return null;
  return +(amount / CRORE).toFixed(1);
}

export function sectorIndexFromName(name) {
  const idx = SECTORS.findIndex((s) => s.name === name);
  return idx >= 0 ? idx : 0;
}

export function resolveInitialInputsFromDraft(draft) {
  if (!draft) {
    return {
      province: 'Bagmati',
      sectorIdx: 0,
      budget: SECTORS[0].min,
    };
  }

  const sectorName = draftSectorToSimSector(draft.sector);
  const sectorIdx = sectorIndexFromName(sectorName);
  const sector = SECTORS[sectorIdx];
  const province = districtToProvince(draft.district);
  const budgetFromDraft = nprToCrore(draft.budgetAmount);
  const budget = budgetFromDraft ?? Math.max(sector.min, Math.min(sector.max, 5));

  return {
    province: PROVINCES.includes(province) ? province : 'Bagmati',
    sectorIdx,
    budget,
  };
}
