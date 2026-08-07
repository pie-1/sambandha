"""Static reference tables mirrored from server/services/ml/data.js (NDHS 2022 / NHIF / Census 2021 anchors)."""

PROVINCES = [
    "Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim",
]

FISCAL_YEARS = [2078, 2079, 2080, 2081]

PROVINCE_BUDGETS = {
    "Koshi": 1823,
    "Madhesh": 2579,
    "Bagmati": 3550,
    "Gandaki": 2019,
    "Lumbini": 2325,
    "Karnali": 1997,
    "Sudurpashchim": 1702,
}

SECTORS = [
    {"name": "Roads & Bridges", "icon": "🛣", "share": 0.30},
    {"name": "Education Infrastructure", "icon": "🏫", "share": 0.10},
    {"name": "Health & Nutrition", "icon": "🏥", "share": 0.09},
    {"name": "Agriculture & Irrigation", "icon": "🌾", "share": 0.13},
    {"name": "Water & Sanitation", "icon": "💧", "share": 0.11},
    {"name": "Rural Electrification", "icon": "⚡", "share": 0.10},
    {"name": "Local Governance Capacity", "icon": "🏛", "share": 0.05},
    {"name": "Tourism & Culture", "icon": "🏔", "share": 0.07},
]

PROVINCE_HEALTH = {
    "Koshi": {"coverage": 81, "gap": 19, "remote": 22, "stunting": 24, "burden": 51, "infra": 62, "risk": 44},
    "Madhesh": {"coverage": 68, "gap": 32, "remote": 6, "stunting": 32, "burden": 60, "infra": 45, "risk": 56},
    "Bagmati": {"coverage": 83, "gap": 17, "remote": 10, "stunting": 19, "burden": 46, "infra": 82, "risk": 32},
    "Gandaki": {"coverage": 93, "gap": 7, "remote": 28, "stunting": 22, "burden": 49, "infra": 72, "risk": 34},
    "Lumbini": {"coverage": 85, "gap": 15, "remote": 18, "stunting": 27, "burden": 55, "infra": 56, "risk": 48},
    "Karnali": {"coverage": 84, "gap": 16, "remote": 52, "stunting": 37, "burden": 66, "infra": 32, "risk": 62},
    "Sudurpashchim": {"coverage": 89, "gap": 11, "remote": 46, "stunting": 33, "burden": 61, "infra": 38, "risk": 60},
}

HEALTH_PROGRAMS = [
    "Immunization", "Maternal & Neonatal", "Nutrition", "Water & Sanitation",
    "Primary Care", "Emergency Services", "Mental Health", "NCD / Diabetes",
]

POLICY_FEATURES = [
    {"key": "budget", "label": "Budget (NPR crore)", "direction": "more budget helps implementation scale"},
    {"key": "coverageGap", "label": "Coverage gap (%)", "direction": "deep gaps make targets harder to hit"},
    {"key": "remoteShare", "label": "Remote population share (%)", "direction": "remote access raises delivery cost"},
    {"key": "infraIndex", "label": "Health facility index (0-100)", "direction": "stronger facilities improve odds"},
    {"key": "diseaseBurden", "label": "Disease burden index (0-100)", "direction": "high burden raises failure risk"},
    {"key": "priorTrack", "label": "Prior program success (%)", "direction": "proven approaches succeed more often"},
]

CLAIM_FEATURES = [
    {"key": "age", "label": "Age (years)"},
    {"key": "familySize", "label": "Household size"},
    {"key": "incomeBand", "label": "Income band (1-4)"},
    {"key": "regionRisk", "label": "Regional risk index (0-100)"},
    {"key": "preExisting", "label": "Pre-existing condition"},
    {"key": "healthIndex", "label": "Self-rated health index (0-100)"},
]

SOURCES = [
    {"name": "Nepal Demographic and Health Survey 2022 (NDHS) - MoHP / USAID", "note": "provincial immunization coverage, stunting, care-seeking"},
    {"name": "Nepal Health Sector Strategic Plan 2022-2030 (NHSS-IP) - MoHP", "note": "programme structure and coverage targets"},
    {"name": "Health Insurance Board / NHIF claims benchmarks", "note": "claim incidence and cost baselines"},
    {"name": "Census 2021 - Central Bureau of Statistics", "note": "population, remoteness and household profiles"},
]
