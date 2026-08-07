/**
 * Map draft fields to simulator inputs
 */

const { PROVINCES, SECTORS, clamp, getSectorByName } = require('../services/simulationModel');

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

const DEFAULT_PROVINCE = 'Bagmati';
const DEFAULT_SECTOR = 'Roads & Bridges';
const CRORE = 10_000_000;

function districtToProvince(district) {
  if (!district) return DEFAULT_PROVINCE;
  return DISTRICT_TO_PROVINCE[district] || DEFAULT_PROVINCE;
}

function draftSectorToSimSector(sector) {
  if (!sector) return DEFAULT_SECTOR;
  return DRAFT_SECTOR_TO_SIM[sector] || DEFAULT_SECTOR;
}

function nprToCrore(amount) {
  if (!amount || amount <= 0) return null;
  return +(amount / CRORE).toFixed(1);
}

function resolveSimulationInputs({ province, sectorName, budget, draft }) {
  let resolvedProvince = province;
  let resolvedSector = sectorName;
  let resolvedBudget = budget;

  if (draft) {
    // A draft-linked run always evaluates the draft's own sector —
    // the sector is not a free parameter for draft simulations.
    resolvedProvince = resolvedProvince || districtToProvince(draft.district);
    resolvedSector = draftSectorToSimSector(draft.sector);
    if (resolvedBudget == null && draft.budgetAmount) {
      resolvedBudget = nprToCrore(draft.budgetAmount);
    }
  }

  resolvedProvince = PROVINCES.includes(resolvedProvince) ? resolvedProvince : DEFAULT_PROVINCE;
  resolvedSector = getSectorByName(resolvedSector) ? resolvedSector : DEFAULT_SECTOR;

  const sectorMeta = getSectorByName(resolvedSector);
  if (resolvedBudget == null) {
    resolvedBudget = sectorMeta.min;
  } else {
    resolvedBudget = clamp(+resolvedBudget, sectorMeta.min, sectorMeta.max);
  }

  return {
    province: resolvedProvince,
    sectorName: resolvedSector,
    budget: resolvedBudget,
  };
}

module.exports = {
  DISTRICT_TO_PROVINCE,
  DRAFT_SECTOR_TO_SIM,
  districtToProvince,
  draftSectorToSimSector,
  nprToCrore,
  resolveSimulationInputs,
};
