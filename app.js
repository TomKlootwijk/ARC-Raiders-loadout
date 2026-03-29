const LIVE_API_BASE = 'https://arcdata.mahcks.com/v1/items';
const CATALOG_CACHE_KEY = 'arc-loadout-live-catalog-v1';
const APP_STATE_KEY = 'arc-loadout-app-state-v1';
const COOKIE_ACTIVE_LOADOUT = 'arc-loadout-active-v1';
const COOKIE_BACKUP_STATE = 'arc-loadout-backup-v1';
const MAX_COOKIE_BYTES = 3500;
const CATALOG_TTL_MS = 1000 * 60 * 60 * 12;
const MAX_BACKPACK_SLOTS = 24;
const MAX_QUICK_SLOTS = 5;
const MAX_SAFE_SLOTS = 3;

const dom = {
  augmentSelect: document.getElementById('augmentSelect'),
  loadoutNameInput: document.getElementById('loadoutNameInput'),
  saveLoadoutBtn: document.getElementById('saveLoadoutBtn'),
  cloneLoadoutBtn: document.getElementById('cloneLoadoutBtn'),
  exportLoadoutBtn: document.getElementById('exportLoadoutBtn'),
  importLoadoutInput: document.getElementById('importLoadoutInput'),
  savedLoadoutSelect: document.getElementById('savedLoadoutSelect'),
  loadSavedBtn: document.getElementById('loadSavedBtn'),
  deleteSavedBtn: document.getElementById('deleteSavedBtn'),
  refreshCatalogBtn: document.getElementById('refreshCatalogBtn'),
  dataStatus: document.getElementById('dataStatus'),
  augmentMeta: document.getElementById('augmentMeta'),
  weightValue: document.getElementById('weightValue'),
  valueValue: document.getElementById('valueValue'),
  selectedItemCount: document.getElementById('selectedItemCount'),
  equipmentSubtitle: document.getElementById('equipmentSubtitle'),
  augmentSlotMount: document.getElementById('augmentSlotMount'),
  shieldSlotMount: document.getElementById('shieldSlotMount'),
  weaponSlotsMount: document.getElementById('weaponSlotsMount'),
  backpackGrid: document.getElementById('backpackGrid'),
  backpackCountLabel: document.getElementById('backpackCountLabel'),
  quickUseGrid: document.getElementById('quickUseGrid'),
  quickUseCountLabel: document.getElementById('quickUseCountLabel'),
  safePocketGrid: document.getElementById('safePocketGrid'),
  safePocketCountLabel: document.getElementById('safePocketCountLabel'),
  integratedToolMount: document.getElementById('integratedToolMount'),
  augmentSlotsMount: document.getElementById('augmentSlotsMount'),
  overflowNotice: document.getElementById('overflowNotice'),
  loadoutBoard: document.getElementById('loadoutBoard'),
  mobileBoardNav: document.getElementById('mobileBoardNav'),
  mobilePanelButtons: [...document.querySelectorAll('.mobile-board-tab')],
  basePartsList: document.getElementById('basePartsList'),
  basePartCount: document.getElementById('basePartCount'),
  craftedPartsList: document.getElementById('craftedPartsList'),
  craftedPartCount: document.getElementById('craftedPartCount'),
  dependencyTree: document.getElementById('dependencyTree'),
  copyBasePartsBtn: document.getElementById('copyBasePartsBtn'),
  copyFullPlanBtn: document.getElementById('copyFullPlanBtn'),
  selectorModal: document.getElementById('selectorModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  clearSlotBtn: document.getElementById('clearSlotBtn'),
  selectorTitle: document.getElementById('selectorTitle'),
  selectorSubtitle: document.getElementById('selectorSubtitle'),
  selectorSearchInput: document.getElementById('selectorSearchInput'),
  selectorFilterChips: document.getElementById('selectorFilterChips'),
  selectorResults: document.getElementById('selectorResults'),
  slotTemplate: document.getElementById('slotTemplate'),
};

const AUGMENTS = [
  {
    id: 'free_loadout_augment',
    name: 'Free Loadout Augment',
    weightLimit: 35,
    shieldCompatibility: ['Light'],
    backpackSlots: 14,
    quickUseSlots: 4,
    safePocketSlots: 0,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [],
    passivePerk: 'Starter frame.',
    recipe: null,
  },
  {
    id: 'combat_mk_1',
    name: 'Combat Mk. 1',
    weightLimit: 45,
    shieldCompatibility: ['Light', 'Medium'],
    backpackSlots: 16,
    quickUseSlots: 4,
    safePocketSlots: 1,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [],
    passivePerk: 'No passive perk.',
    recipe: { rubber_parts: 6, plastic_parts: 6 },
  },
  {
    id: 'combat_mk_2',
    name: 'Combat Mk. 2',
    weightLimit: 55,
    shieldCompatibility: ['Light', 'Medium', 'Heavy'],
    backpackSlots: 18,
    quickUseSlots: 4,
    safePocketSlots: 1,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [{ kind: 'grenade', count: 1, label: 'Grenade Use' }],
    passivePerk: 'Restores 1 health every 5s, pauses after taking damage.',
    recipe: { electrical_components: 2, magnet: 3 },
  },
  {
    id: 'combat_mk_3_aggressive',
    name: 'Combat Mk. 3 (Aggressive)',
    weightLimit: 65,
    shieldCompatibility: ['Light', 'Medium', 'Heavy'],
    backpackSlots: 18,
    quickUseSlots: 4,
    safePocketSlots: 1,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [{ kind: 'grenade', count: 2, label: 'Grenade Use' }],
    passivePerk: 'Restores 2 health every 5s, pauses after taking damage.',
    recipe: { advanced_electrical_components: 2, processor: 3 },
  },
  {
    id: 'combat_mk_3_flanking',
    name: 'Combat Mk. 3 (Flanking)',
    weightLimit: 60,
    shieldCompatibility: ['Light'],
    backpackSlots: 20,
    quickUseSlots: 5,
    safePocketSlots: 2,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [{ kind: 'deployable_utility', count: 3, label: 'Deployable Utility' }],
    passivePerk: 'Pistols and hand cannons equip faster when stowed.',
    recipe: { advanced_electrical_components: 2, processor: 3 },
  },
  {
    id: 'looting_mk_1',
    name: 'Looting Mk. 1',
    weightLimit: 50,
    shieldCompatibility: ['Light'],
    backpackSlots: 18,
    quickUseSlots: 4,
    safePocketSlots: 1,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [],
    passivePerk: 'No passive perk.',
    recipe: { rubber_parts: 6, plastic_parts: 6 },
  },
  {
    id: 'looting_mk_2',
    name: 'Looting Mk. 2',
    weightLimit: 60,
    shieldCompatibility: ['Light'],
    backpackSlots: 22,
    quickUseSlots: 4,
    safePocketSlots: 2,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [{ kind: 'trinket', count: 3, label: 'Trinket' }],
    passivePerk: 'Throws off attached Ticks after 1s.',
    recipe: { electrical_components: 2, magnet: 3 },
  },
  {
    id: 'looting_mk_3_cautious',
    name: 'Looting Mk. 3 (Cautious)',
    weightLimit: 70,
    shieldCompatibility: ['Light'],
    backpackSlots: 24,
    quickUseSlots: 5,
    safePocketSlots: 2,
    weaponSlots: 2,
    integratedTool: 'Integrated Binoculars',
    augmentedSlots: [],
    passivePerk: 'On shield break, weak Adrenaline Shot.',
    recipe: { advanced_electrical_components: 2, processor: 3 },
  },
  {
    id: 'looting_mk_3_safekeeper',
    name: 'Looting Mk. 3 (Safekeeper)',
    weightLimit: 65,
    shieldCompatibility: ['Light', 'Medium', 'Heavy'],
    backpackSlots: 18,
    quickUseSlots: 4,
    safePocketSlots: 1,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [{ kind: 'trinket', count: 2, label: 'Trinket' }],
    passivePerk: 'Extra trinket space.',
    recipe: { advanced_electrical_components: 2, processor: 3 },
  },
  {
    id: 'looting_mk_3_survivor',
    name: 'Looting Mk. 3 (Survivor)',
    weightLimit: 80,
    shieldCompatibility: ['Light', 'Medium'],
    backpackSlots: 20,
    quickUseSlots: 5,
    safePocketSlots: 3,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [{ kind: 'deployable_utility', count: 1, label: 'Deployable Utility' }],
    passivePerk: 'While downed and stationary, regen downed health.',
    recipe: { advanced_electrical_components: 2, processor: 3 },
  },
  {
    id: 'tactical_mk_1',
    name: 'Tactical Mk. 1',
    weightLimit: 40,
    shieldCompatibility: ['Light', 'Medium'],
    backpackSlots: 15,
    quickUseSlots: 5,
    safePocketSlots: 1,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [],
    passivePerk: 'No passive perk.',
    recipe: { rubber_parts: 6, plastic_parts: 6 },
  },
  {
    id: 'tactical_mk_2',
    name: 'Tactical Mk. 2',
    weightLimit: 45,
    shieldCompatibility: ['Light', 'Medium'],
    backpackSlots: 17,
    quickUseSlots: 5,
    safePocketSlots: 1,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [{ kind: 'deployable_utility', count: 1, label: 'Deployable Utility' }],
    passivePerk: 'On shield break, deploys a small smoke grenade.',
    recipe: { electrical_components: 2, magnet: 3 },
  },
  {
    id: 'tactical_mk_3_defensive',
    name: 'Tactical Mk. 3 (Defensive)',
    weightLimit: 60,
    shieldCompatibility: ['Light', 'Medium', 'Heavy'],
    backpackSlots: 20,
    quickUseSlots: 5,
    safePocketSlots: 1,
    weaponSlots: 2,
    integratedTool: 'Integrated Shield Recharger',
    augmentedSlots: [],
    passivePerk: 'Shield Rechargers can be used while running.',
    recipe: { advanced_electrical_components: 2, processor: 3 },
  },
  {
    id: 'tactical_mk_3_healing',
    name: 'Tactical Mk. 3 (Healing)',
    weightLimit: 55,
    shieldCompatibility: ['Light', 'Medium'],
    backpackSlots: 16,
    quickUseSlots: 4,
    safePocketSlots: 3,
    weaponSlots: 2,
    integratedTool: null,
    augmentedSlots: [{ kind: 'healing', count: 3, label: 'Healing' }],
    passivePerk: 'On revive, a healing cloud restores 20 health over 10s.',
    recipe: { advanced_electrical_components: 2, processor: 3 },
  },
  {
    id: 'tactical_mk_3_revival',
    name: 'Tactical Mk. 3 (Revival)',
    weightLimit: 65,
    shieldCompatibility: ['Light'],
    backpackSlots: 16,
    quickUseSlots: 5,
    safePocketSlots: 2,
    weaponSlots: 2,
    integratedTool: 'Integrated Defibrillator',
    augmentedSlots: [],
    passivePerk: 'Faster revive-focused frame.',
    recipe: { advanced_electrical_components: 2, processor: 3 },
  },
];

const ATTACHMENT_SLOT_LABELS = {
  muzzle: 'Muzzle',
  shotgun_muzzle: 'Shotgun Muzzle',
  underbarrel: 'Underbarrel',
  light_magazine: 'Light Mag',
  medium_magazine: 'Medium Mag',
  heavy_magazine: 'Heavy Mag',
  shotgun_magazine: 'Shotgun Mag',
  stock: 'Stock',
  tech: 'Tech',
  optic: 'Optic',
  special: 'Special',
};

const SLOT_KIND_LABELS = {
  augment: 'Augment',
  shield: 'Shield',
  weapon: 'Weapon',
  backpack: 'Backpack',
  quick: 'Quick Use',
  augmented: 'Augmented',
  safe: 'Safe Pocket',
};

const seedData = buildSeedData();
const augmentMap = Object.fromEntries(AUGMENTS.map((augment) => [augment.id, augment]));

const state = {
  items: [],
  itemsById: {},
  catalogSource: 'seed',
  catalogUpdatedAt: null,
  currentLoadout: null,
  savedLoadouts: {},
  activeSavedName: '',
  modal: {
    open: false,
    context: null,
    query: '',
    filter: 'all',
  },
  overflowBin: [],
  mobilePanel: 'equipment',
};

function buildSeedData() {
  const materials = [
    makeItem('metal_parts', 'Metal Parts', 'Basic Material', { weight: 0.2, value: 50, stackSize: 50 }),
    makeItem('rubber_parts', 'Rubber Parts', 'Basic Material', { weight: 0.2, value: 50, stackSize: 50 }),
    makeItem('plastic_parts', 'Plastic Parts', 'Basic Material', { weight: 0.2, value: 50, stackSize: 50 }),
    makeItem('chemicals', 'Chemicals', 'Basic Material', { weight: 0.2, value: 50, stackSize: 50 }),
    makeItem('wires', 'Wires', 'Topside Material', { weight: 0.25, value: 200, stackSize: 15 }),
    makeItem('duct_tape', 'Duct Tape', 'Topside Material', { weight: 0.25, value: 300, stackSize: 15 }),
    makeItem('steel_spring', 'Steel Spring', 'Topside Material', { weight: 0.25, value: 300, stackSize: 15 }),
    makeItem('magnet', 'Magnet', 'Topside Material', { weight: 0.3, value: 640, stackSize: 10 }),
    makeItem('processor', 'Processor', 'Topside Material', { weight: 0.4, value: 1000, stackSize: 5 }),
    makeItem('canister', 'Canister', 'Topside Material', { weight: 0.4, value: 640, stackSize: 10 }),
    makeItem('simple_gun_parts', 'Simple Gun Parts', 'Topside Material', { weight: 0.3, value: 330, stackSize: 10 }),
    makeItem('light_gun_parts', 'Light Gun Parts', 'Refined Material', {
      weight: 0.5,
      value: 700,
      stackSize: 5,
      recipe: { simple_gun_parts: 4 },
      craftBench: ['refiner'],
      stationLevelRequired: 2,
    }),
    makeItem('medium_gun_parts', 'Medium Gun Parts', 'Refined Material', {
      weight: 0.5,
      value: 700,
      stackSize: 5,
      recipe: { simple_gun_parts: 4 },
      craftBench: ['refiner'],
      stationLevelRequired: 2,
    }),
    makeItem('heavy_gun_parts', 'Heavy Gun Parts', 'Refined Material', {
      weight: 0.5,
      value: 700,
      stackSize: 5,
      recipe: { simple_gun_parts: 4 },
      craftBench: ['refiner'],
      stationLevelRequired: 2,
    }),
    makeItem('mechanical_components', 'Mechanical Components', 'Refined Material', {
      weight: 0.5,
      value: 640,
      stackSize: 10,
      recipe: { metal_parts: 7, rubber_parts: 3 },
      craftBench: ['refiner'],
      stationLevelRequired: 1,
    }),
    makeItem('electrical_components', 'Electrical Components', 'Refined Material', {
      weight: 0.5,
      value: 640,
      stackSize: 10,
      recipe: { plastic_parts: 8, rubber_parts: 4 },
      craftBench: ['refiner'],
      stationLevelRequired: 1,
    }),
    makeItem('advanced_electrical_components', 'Advanced Electrical Components', 'Refined Material', {
      weight: 1,
      value: 1750,
      stackSize: 5,
      recipe: { wires: 3, electrical_components: 2 },
      craftBench: ['refiner'],
      stationLevelRequired: 2,
    }),
    makeItem('advanced_mechanical_components', 'Advanced Mechanical Components', 'Refined Material', {
      weight: 1,
      value: 1750,
      stackSize: 5,
      recipe: { steel_spring: 2, mechanical_components: 2 },
      craftBench: ['refiner'],
      stationLevelRequired: 2,
    }),
    makeItem('mod_components', 'Mod Components', 'Refined Material', {
      weight: 1,
      value: 1750,
      stackSize: 5,
      recipe: { steel_spring: 2, mechanical_components: 2 },
      craftBench: ['refiner'],
      stationLevelRequired: 2,
    }),
  ];

  const gear = [
    makeItem('light_shield_i', 'Light Shield I', 'Shield', { weight: 2.0, value: 640, rarity: 'Common', shieldTier: 'Light', recipe: { plastic_parts: 4, metal_parts: 2 } }),
    makeItem('medium_shield_i', 'Medium Shield I', 'Shield', { weight: 4.2, value: 3000, rarity: 'Rare', shieldTier: 'Medium', recipe: { electrical_components: 1, plastic_parts: 4 } }),
    makeItem('heavy_shield_i', 'Heavy Shield I', 'Shield', { weight: 6.5, value: 5000, rarity: 'Epic', shieldTier: 'Heavy', recipe: { advanced_electrical_components: 2, processor: 1 } }),
    makeItem('bandage', 'Bandage', 'Healing', { weight: 0.2, value: 120, stackSize: 5, recipe: { plastic_parts: 1, chemicals: 1 } }),
    makeItem('repair_syringe', 'Repair Syringe', 'Quick Use', { weight: 0.2, value: 180, stackSize: 5, recipe: { chemicals: 2, plastic_parts: 1 } }),
    makeItem('adrenaline_shot', 'Adrenaline Shot', 'Quick Use', { weight: 0.2, value: 300, stackSize: 5, recipe: { chemicals: 3, plastic_parts: 3 } }),
    makeItem('light_impact_grenade', 'Light Impact Grenade', 'Grenade', { weight: 0.5, value: 260, stackSize: 2, recipe: { plastic_parts: 2, chemicals: 3 } }),
    makeItem('smoke_grenade', 'Smoke Grenade', 'Grenade', { weight: 0.5, value: 260, stackSize: 2, recipe: { plastic_parts: 1, chemicals: 5 } }),
    makeItem('barricade_kit', 'Barricade Kit', 'Deployable Utility', { weight: 1.2, value: 640, stackSize: 1, recipe: { mechanical_components: 1 } }),
    makeItem('zipline_kit', 'Zipline Kit', 'Deployable Utility', { weight: 1.1, value: 640, stackSize: 1, recipe: { mechanical_components: 1, wires: 1 } }),
    makeItem('faded_photograph', 'Faded Photograph', 'Trinket', { weight: 0.1, value: 640, stackSize: 15 }),
    makeItem('music_box', 'Music Box', 'Trinket', { weight: 0.3, value: 5000, stackSize: 3 }),
    makeItem('ancient_fort_key', 'Ancient Fort Security Code', 'Key', { weight: 0.1, value: 280, stackSize: 1 }),
  ];

  const attachments = [
    makeItem('muzzle_brake_i', 'Muzzle Brake I', 'Modification', {
      rarity: 'Common',
      weight: 0.25,
      value: 640,
      attachmentCategory: 'muzzle',
      recipe: { metal_parts: 6, wires: 1 },
      compatibleWeaponFamilies: ['assault rifle', 'battle rifle', 'pistol', 'hand cannon', 'sniper rifle'],
    }),
    makeItem('compensator_i', 'Compensator I', 'Modification', {
      rarity: 'Common',
      weight: 0.25,
      value: 640,
      attachmentCategory: 'muzzle',
      recipe: { metal_parts: 6, wires: 1 },
      compatibleWeaponFamilies: ['assault rifle', 'battle rifle', 'pistol', 'hand cannon', 'sniper rifle'],
    }),
    makeItem('shotgun_choke_i', 'Shotgun Choke I', 'Modification', {
      rarity: 'Common',
      weight: 0.25,
      value: 640,
      attachmentCategory: 'shotgun_muzzle',
      recipe: { metal_parts: 6, wires: 1 },
      compatibleAmmoClasses: ['shotgun'],
    }),
    makeItem('silencer_i', 'Silencer I', 'Modification', {
      rarity: 'Uncommon',
      weight: 0.25,
      value: 2000,
      attachmentCategory: 'muzzle',
      recipe: { mechanical_components: 2, wires: 4 },
      compatibleWeaponFamilies: ['assault rifle', 'battle rifle', 'pistol', 'hand cannon', 'sniper rifle'],
      description: 'Compatible with: Ferro, Kettle, Rattler, Arpeggio, Burletta, Renegade, Bettina',
    }),
    makeItem('extended_barrel', 'Extended Barrel', 'Modification', {
      rarity: 'Epic',
      weight: 0.5,
      value: 5000,
      attachmentCategory: 'muzzle',
      recipe: { mod_components: 2, wires: 8 },
      compatibleWeaponFamilies: ['assault rifle', 'battle rifle', 'pistol', 'hand cannon', 'sniper rifle'],
      description: 'Compatible with: Ferro, Kettle, Rattler, Anvil, Arpeggio, Burletta, Renegade, Bettina',
    }),
    makeItem('angled_grip_i', 'Angled Grip I', 'Modification', {
      rarity: 'Common',
      weight: 0.25,
      value: 640,
      attachmentCategory: 'underbarrel',
      recipe: { plastic_parts: 6, duct_tape: 1 },
      compatibleWeaponFamilies: ['assault rifle', 'battle rifle', 'sniper rifle', 'shotgun'],
    }),
    makeItem('vertical_grip_i', 'Vertical Grip I', 'Modification', {
      rarity: 'Common',
      weight: 0.25,
      value: 640,
      attachmentCategory: 'underbarrel',
      recipe: { plastic_parts: 6, duct_tape: 1 },
      compatibleWeaponFamilies: ['assault rifle', 'battle rifle', 'sniper rifle', 'shotgun', 'pistol'],
    }),
    makeItem('stable_stock_i', 'Stable Stock I', 'Modification', {
      rarity: 'Common',
      weight: 0.3,
      value: 640,
      attachmentCategory: 'stock',
      recipe: { rubber_parts: 6, duct_tape: 1 },
      compatibleWeaponFamilies: ['assault rifle', 'battle rifle', 'sniper rifle', 'shotgun'],
    }),
    makeItem('extended_light_mag_i', 'Extended Light Mag I', 'Modification', {
      rarity: 'Common',
      weight: 0.25,
      value: 640,
      attachmentCategory: 'light_magazine',
      recipe: { plastic_parts: 6, steel_spring: 1 },
      compatibleAmmoClasses: ['light'],
    }),
    makeItem('extended_medium_mag_i', 'Extended Medium Mag I', 'Modification', {
      rarity: 'Common',
      weight: 0.25,
      value: 640,
      attachmentCategory: 'medium_magazine',
      recipe: { plastic_parts: 6, steel_spring: 1 },
      compatibleAmmoClasses: ['medium'],
    }),
    makeItem('extended_shotgun_mag_i', 'Extended Shotgun Mag I', 'Modification', {
      rarity: 'Common',
      weight: 0.25,
      value: 640,
      attachmentCategory: 'shotgun_magazine',
      recipe: { plastic_parts: 6, steel_spring: 1 },
      compatibleAmmoClasses: ['shotgun'],
    }),
    makeItem('anvil_splitter', 'Anvil Splitter', 'Modification', {
      rarity: 'Legendary',
      weight: 0.5,
      value: 7000,
      attachmentCategory: 'tech',
      compatibleWeaponIds: ['anvil_i', 'anvil_ii', 'anvil_iii'],
      description: 'Tech mod exclusively for the Anvil. Compatible with: Anvil',
    }),
  ];

  const weapons = [
    makeItem('anvil_i', 'Anvil I', 'Hand Cannon', {
      rarity: 'Uncommon',
      weight: 5.0,
      value: 5000,
      ammoType: 'Heavy Ammo',
      weaponFamily: 'Hand Cannon',
      recipe: { mechanical_components: 5, simple_gun_parts: 6 },
      attachmentSlots: ['muzzle', 'tech'],
      description: 'Single-action heavy hand cannon.',
    }),
    makeItem('anvil_ii', 'Anvil II', 'Hand Cannon', {
      rarity: 'Rare',
      weight: 5.0,
      value: 7000,
      ammoType: 'Heavy Ammo',
      weaponFamily: 'Hand Cannon',
      recipe: { anvil_i: 1, mechanical_components: 3, simple_gun_parts: 1 },
      attachmentSlots: ['muzzle', 'tech'],
    }),
    makeItem('anvil_iii', 'Anvil III', 'Hand Cannon', {
      rarity: 'Epic',
      weight: 5.0,
      value: 10000,
      ammoType: 'Heavy Ammo',
      weaponFamily: 'Hand Cannon',
      recipe: { anvil_ii: 1, mechanical_components: 4, heavy_gun_parts: 1 },
      attachmentSlots: ['muzzle', 'tech'],
    }),
    makeItem('burletta_i', 'Burletta I', 'Pistol', {
      rarity: 'Uncommon',
      weight: 4.0,
      value: 2900,
      ammoType: 'Light Ammo',
      weaponFamily: 'Pistol',
      recipe: { mechanical_components: 3, simple_gun_parts: 3 },
      attachmentSlots: ['muzzle', 'light_magazine'],
    }),
    makeItem('kettle_i', 'Kettle I', 'Assault Rifle', {
      rarity: 'Common',
      weight: 7.0,
      value: 840,
      ammoType: 'Light Ammo',
      weaponFamily: 'Assault Rifle',
      recipe: { metal_parts: 6, rubber_parts: 8 },
      attachmentSlots: ['muzzle', 'underbarrel', 'light_magazine', 'stock'],
    }),
    makeItem('kettle_ii', 'Kettle II', 'Assault Rifle', {
      rarity: 'Uncommon',
      weight: 7.0,
      value: 2000,
      ammoType: 'Light Ammo',
      weaponFamily: 'Assault Rifle',
      recipe: { kettle_i: 1, metal_parts: 8, plastic_parts: 10 },
      attachmentSlots: ['muzzle', 'underbarrel', 'light_magazine', 'stock'],
    }),
    makeItem('kettle_iii', 'Kettle III', 'Assault Rifle', {
      rarity: 'Rare',
      weight: 7.0,
      value: 3000,
      ammoType: 'Light Ammo',
      weaponFamily: 'Assault Rifle',
      recipe: { kettle_ii: 1, metal_parts: 10, simple_gun_parts: 1 },
      attachmentSlots: ['muzzle', 'underbarrel', 'light_magazine', 'stock'],
    }),
    makeItem('rattler_i', 'Rattler I', 'Assault Rifle', {
      rarity: 'Common',
      weight: 6.0,
      value: 1750,
      ammoType: 'Medium Ammo',
      weaponFamily: 'Assault Rifle',
      recipe: { metal_parts: 16, rubber_parts: 12 },
      attachmentSlots: ['muzzle', 'underbarrel', 'stock'],
    }),
    makeItem('rattler_ii', 'Rattler II', 'Assault Rifle', {
      rarity: 'Uncommon',
      weight: 6.0,
      value: 3000,
      ammoType: 'Medium Ammo',
      weaponFamily: 'Assault Rifle',
      recipe: { rattler_i: 1, metal_parts: 10, rubber_parts: 10 },
      attachmentSlots: ['muzzle', 'underbarrel', 'stock'],
    }),
    makeItem('rattler_iii', 'Rattler III', 'Assault Rifle', {
      rarity: 'Rare',
      weight: 6.0,
      value: 5000,
      ammoType: 'Medium Ammo',
      weaponFamily: 'Assault Rifle',
      recipe: { rattler_ii: 1, mechanical_components: 3, simple_gun_parts: 1 },
      attachmentSlots: ['muzzle', 'underbarrel', 'stock'],
    }),
    makeItem('ferro_i', 'Ferro I', 'Battle Rifle', {
      rarity: 'Common',
      weight: 8.0,
      value: 475,
      ammoType: 'Heavy Ammo',
      weaponFamily: 'Battle Rifle',
      recipe: { metal_parts: 5, rubber_parts: 2 },
      attachmentSlots: ['muzzle', 'underbarrel', 'stock'],
      description: 'Break-action battle rifle.',
    }),
    makeItem('ferro_ii', 'Ferro II', 'Battle Rifle', {
      rarity: 'Uncommon',
      weight: 8.0,
      value: 1000,
      ammoType: 'Heavy Ammo',
      weaponFamily: 'Battle Rifle',
      recipe: { ferro_i: 1, metal_parts: 7 },
      attachmentSlots: ['muzzle', 'underbarrel', 'stock'],
      description: 'Break-action battle rifle.',
    }),
    makeItem('ferro_iii', 'Ferro III', 'Battle Rifle', {
      rarity: 'Rare',
      weight: 8.0,
      value: 2000,
      ammoType: 'Heavy Ammo',
      weaponFamily: 'Battle Rifle',
      recipe: { ferro_ii: 1, metal_parts: 9, simple_gun_parts: 1 },
      attachmentSlots: ['muzzle', 'underbarrel', 'stock'],
      description: 'Break-action battle rifle.',
    }),
    makeItem('arpeggio_i', 'Arpeggio I', 'Assault Rifle', {
      rarity: 'Uncommon',
      weight: 7.0,
      value: 5500,
      ammoType: 'Medium Ammo',
      weaponFamily: 'Assault Rifle',
      recipe: { mechanical_components: 6, simple_gun_parts: 6 },
      attachmentSlots: ['muzzle', 'underbarrel', 'medium_magazine', 'stock'],
    }),
    makeItem('renegade_i', 'Renegade I', 'Battle Rifle', {
      rarity: 'Rare',
      weight: 10.0,
      value: 7000,
      ammoType: 'Medium Ammo',
      weaponFamily: 'Battle Rifle',
      recipe: { advanced_mechanical_components: 2, medium_gun_parts: 3 },
      attachmentSlots: ['muzzle', 'medium_magazine', 'stock'],
      description: 'Lever-action battle rifle.',
    }),
    makeItem('bettina_i', 'Bettina I', 'Assault Rifle', {
      rarity: 'Epic',
      weight: 11.0,
      value: 8000,
      ammoType: 'Heavy Ammo',
      weaponFamily: 'Assault Rifle',
      recipe: { advanced_mechanical_components: 3, heavy_gun_parts: 3, canister: 3 },
      attachmentSlots: ['muzzle', 'underbarrel', 'stock'],
    }),
    makeItem('bettina_ii', 'Bettina II', 'Assault Rifle', {
      rarity: 'Legendary',
      weight: 11.0,
      value: 11000,
      ammoType: 'Heavy Ammo',
      weaponFamily: 'Assault Rifle',
      recipe: { bettina_i: 1, advanced_mechanical_components: 1, heavy_gun_parts: 2 },
      attachmentSlots: ['muzzle', 'underbarrel', 'stock'],
    }),
    makeItem('il_toro_i', 'Il Toro I', 'Shotgun', {
      rarity: 'Uncommon',
      weight: 8.0,
      value: 5000,
      ammoType: 'Shotgun Ammo',
      weaponFamily: 'Shotgun',
      recipe: { mechanical_components: 5, simple_gun_parts: 6 },
      attachmentSlots: ['shotgun_muzzle', 'underbarrel', 'shotgun_magazine', 'stock'],
      description: 'Pump-action shotgun.',
    }),
    makeItem('il_toro_ii', 'Il Toro II', 'Shotgun', {
      rarity: 'Rare',
      weight: 8.0,
      value: 7000,
      ammoType: 'Shotgun Ammo',
      weaponFamily: 'Shotgun',
      recipe: { il_toro_i: 1, mechanical_components: 3, simple_gun_parts: 1 },
      attachmentSlots: ['shotgun_muzzle', 'underbarrel', 'shotgun_magazine', 'stock'],
      description: 'Pump-action shotgun.',
    }),
    makeItem('venator_i', 'Venator I', 'Pistol', {
      rarity: 'Rare',
      weight: 5.0,
      value: 7000,
      ammoType: 'Medium Ammo',
      weaponFamily: 'Pistol',
      recipe: { advanced_mechanical_components: 2, medium_gun_parts: 3, magnet: 5 },
      attachmentSlots: ['underbarrel', 'medium_magazine'],
    }),
  ];

  const augmentItems = AUGMENTS.map((augment) => makeItem(augment.id, augment.name, 'Augment', {
    weight: 2,
    value: 640,
    rarity: 'Augment',
    recipe: augment.recipe || undefined,
  }));

  return [...materials, ...gear, ...attachments, ...weapons, ...augmentItems];
}

function makeItem(id, name, type, options = {}) {
  return {
    id,
    name,
    type,
    rarity: options.rarity || 'Common',
    value: options.value ?? 0,
    weightKg: options.weight ?? 0,
    stackSize: options.stackSize ?? 1,
    recipe: options.recipe || null,
    craftBench: options.craftBench || [],
    stationLevelRequired: options.stationLevelRequired || null,
    imageFilename: options.image || '',
    description: options.description || '',
    shieldTier: options.shieldTier || null,
    attachmentCategory: options.attachmentCategory || null,
    attachmentSlots: options.attachmentSlots || null,
    ammoType: options.ammoType || null,
    weaponFamily: options.weaponFamily || null,
    compatibleWeaponIds: options.compatibleWeaponIds || null,
    compatibleWeaponFamilies: options.compatibleWeaponFamilies || null,
    compatibleAmmoClasses: options.compatibleAmmoClasses || null,
    updatedAt: options.updatedAt || null,
    raw: {
      seed: true,
      attachmentSlots: options.attachmentSlots || null,
      attachmentCategory: options.attachmentCategory || null,
      ammoType: options.ammoType || null,
      weaponFamily: options.weaponFamily || null,
      compatibleWeaponIds: options.compatibleWeaponIds || null,
      compatibleWeaponFamilies: options.compatibleWeaponFamilies || null,
      compatibleAmmoClasses: options.compatibleAmmoClasses || null,
    },
  };
}

function defaultLoadout(augmentId = 'looting_mk_2') {
  const augment = augmentMap[augmentId] || AUGMENTS[0];
  return normalizeLoadout({
    name: '',
    augmentId: augment.id,
    shield: null,
    weapons: [{ itemId: null, attachments: {} }, { itemId: null, attachments: {} }],
    backpack: Array.from({ length: MAX_BACKPACK_SLOTS }, () => null),
    quickUse: Array.from({ length: MAX_QUICK_SLOTS }, () => null),
    safePocket: Array.from({ length: MAX_SAFE_SLOTS }, () => null),
    augmented: buildEmptyAugmentSlots(augment),
  });
}

function buildEmptyAugmentSlots(augment) {
  const slots = [];
  for (const group of augment.augmentedSlots) {
    for (let i = 0; i < group.count; i += 1) {
      slots.push({ kind: group.kind, label: group.label, itemId: null, qty: 1 });
    }
  }
  return slots;
}

function normalizeLoadout(loadout) {
  const augment = augmentMap[loadout.augmentId] || AUGMENTS[0];
  const normalized = {
    name: loadout.name || '',
    augmentId: augment.id,
    shield: normalizeStackEntry(loadout.shield),
    weapons: Array.from({ length: 2 }, (_, index) => normalizeWeaponEntry(loadout.weapons?.[index])),
    backpack: Array.from({ length: MAX_BACKPACK_SLOTS }, (_, index) => normalizeStackEntry(loadout.backpack?.[index])),
    quickUse: Array.from({ length: MAX_QUICK_SLOTS }, (_, index) => normalizeStackEntry(loadout.quickUse?.[index])),
    safePocket: Array.from({ length: MAX_SAFE_SLOTS }, (_, index) => normalizeStackEntry(loadout.safePocket?.[index])),
    augmented: rebuildAugmentedEntries(loadout.augmented, augment),
  };
  return normalized;
}

function normalizeStackEntry(entry) {
  if (!entry || !entry.itemId) return null;
  return {
    itemId: entry.itemId,
    qty: Math.max(1, Number(entry.qty) || 1),
  };
}

function normalizeWeaponEntry(entry) {
  if (!entry || !entry.itemId) {
    return { itemId: null, attachments: {} };
  }
  return {
    itemId: entry.itemId,
    attachments: { ...(entry.attachments || {}) },
  };
}

function rebuildAugmentedEntries(existingEntries, augment) {
  const fresh = buildEmptyAugmentSlots(augment);
  const safeEntries = Array.isArray(existingEntries) ? existingEntries : [];
  return fresh.map((slot, index) => {
    const existing = safeEntries[index];
    if (!existing || existing.kind !== slot.kind) return slot;
    return { ...slot, ...normalizeStackEntry(existing) };
  });
}

function setDataStatus(text, tone = 'muted') {
  dom.dataStatus.textContent = text;
  dom.dataStatus.style.borderColor = tone === 'ok'
    ? 'rgba(98, 213, 141, 0.45)'
    : tone === 'warn'
      ? 'rgba(243, 199, 109, 0.45)'
      : 'rgba(151, 178, 222, 0.45)';
  dom.dataStatus.style.color = tone === 'ok'
    ? '#dbffe6'
    : tone === 'warn'
      ? '#fff0ca'
      : 'var(--muted-strong)';
}

async function init() {
  hydrateAppState();
  bindEvents();
  renderAugmentOptions();
  if (!state.currentLoadout) {
    state.currentLoadout = defaultLoadout(getCookie(COOKIE_ACTIVE_LOADOUT) || 'looting_mk_2');
  }
  applyCatalog(seedData, 'seed', null);
  await loadCatalog();
  renderAll();
}

function bindEvents() {
  dom.augmentSelect.addEventListener('change', () => {
    swapAugment(dom.augmentSelect.value);
  });
  dom.loadoutNameInput.addEventListener('input', () => {
    state.currentLoadout.name = dom.loadoutNameInput.value.trimStart();
    persistAppState();
  });
  dom.saveLoadoutBtn.addEventListener('click', saveCurrentLoadout);
  dom.cloneLoadoutBtn.addEventListener('click', cloneCurrentLoadout);
  dom.exportLoadoutBtn.addEventListener('click', exportCurrentLoadout);
  dom.importLoadoutInput.addEventListener('change', importLoadoutFromFile);
  dom.loadSavedBtn.addEventListener('click', loadSelectedSavedLoadout);
  dom.deleteSavedBtn.addEventListener('click', deleteSelectedSavedLoadout);
  dom.savedLoadoutSelect.addEventListener('change', () => {
    state.activeSavedName = dom.savedLoadoutSelect.value;
  });
  dom.refreshCatalogBtn.addEventListener('click', () => loadCatalog(true));
  dom.copyBasePartsBtn.addEventListener('click', copyBaseParts);
  dom.copyFullPlanBtn.addEventListener('click', copyFullPlan);
  dom.closeModalBtn.addEventListener('click', closeModal);
  dom.clearSlotBtn.addEventListener('click', clearModalTarget);
  dom.selectorSearchInput.addEventListener('input', () => {
    state.modal.query = dom.selectorSearchInput.value;
    renderSelectorModal();
  });
  dom.selectorModal.addEventListener('click', (event) => {
    const closeRequested = event.target?.dataset?.closeModal === 'true';
    if (closeRequested) closeModal();
  });
  dom.mobilePanelButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.mobilePanel = button.dataset.mobilePanel || 'equipment';
      renderMobileBoardNav();
    });
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.modal.open) closeModal();
  });
}

function hydrateAppState() {
  let restored = null;
  try {
    restored = JSON.parse(localStorage.getItem(APP_STATE_KEY) || 'null');
  } catch {
    restored = null;
  }
  if (!restored) {
    const cookieBackup = getCookie(COOKIE_BACKUP_STATE);
    if (cookieBackup) {
      try {
        restored = JSON.parse(decodeURIComponent(cookieBackup));
      } catch {
        restored = null;
      }
    }
  }
  if (!restored) return;
  state.savedLoadouts = restored.savedLoadouts || {};
  state.activeSavedName = restored.activeSavedName || '';
  state.currentLoadout = restored.currentLoadout ? normalizeLoadout(restored.currentLoadout) : null;
}

function persistAppState() {
  const payload = {
    savedLoadouts: state.savedLoadouts,
    activeSavedName: state.activeSavedName,
    currentLoadout: state.currentLoadout,
  };
  try {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(payload));
  } catch {
    // ignore and fallback to cookie mirror below
  }
  const cookieValue = encodeURIComponent(JSON.stringify(payload));
  if (cookieValue.length <= MAX_COOKIE_BYTES) {
    setCookie(COOKIE_BACKUP_STATE, cookieValue, 180);
  }
  setCookie(COOKIE_ACTIVE_LOADOUT, state.currentLoadout?.augmentId || 'looting_mk_2', 180);
}

async function loadCatalog(forceRefresh = false) {
  const cached = readCatalogCache();
  if (!forceRefresh && cached) {
    applyCatalog(cached.items, 'cache', cached.updatedAt || cached.cachedAt || null);
    renderAll();
    return;
  }

  setDataStatus('Loading live catalog…');
  try {
    const items = await fetchAllItems();
    writeCatalogCache(items);
    applyCatalog(items, 'live', new Date().toISOString());
    setDataStatus(`Live catalog loaded · ${items.length} items`, 'ok');
  } catch (error) {
    console.error(error);
    const fallback = cached?.items?.length ? cached.items : seedData;
    applyCatalog(fallback, cached?.items?.length ? 'cache' : 'seed', cached?.updatedAt || null);
    setDataStatus(cached?.items?.length ? 'Using cached catalog' : 'Using fallback demo catalog', 'warn');
  }
  renderAll();
}

function readCatalogCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CATALOG_CACHE_KEY) || 'null');
    if (!cached?.items?.length) return null;
    if (Date.now() - cached.cachedAt > CATALOG_TTL_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeCatalogCache(items) {
  try {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({
      items,
      cachedAt: Date.now(),
      updatedAt: new Date().toISOString(),
    }));
  } catch {
    // ignore cache failures
  }
}

async function fetchAllItems() {
  let offset = 0;
  const limit = 45;
  const all = [];
  while (true) {
    const url = `${LIVE_API_BASE}?full=true&offset=${offset}&limit=${limit}`;
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`Catalog request failed at offset ${offset}`);
    const payload = await response.json();
    const pageItems = Array.isArray(payload.items) ? payload.items : [];
    all.push(...pageItems);
    if (!pageItems.length || pageItems.length < limit || !payload.next) break;
    offset += limit;
  }
  return all;
}

function applyCatalog(items, source, updatedAt) {
  const merged = mergeCatalogWithSynthetic(items);
  state.items = merged;
  state.itemsById = Object.fromEntries(merged.map((item) => [item.id, item]));
  state.catalogSource = source;
  state.catalogUpdatedAt = updatedAt;
  repairLoadoutReferences();
}

function mergeCatalogWithSynthetic(rawItems) {
  const normalizedLive = rawItems.map(normalizeLiveItem);
  const byId = new Map(normalizedLive.map((item) => [item.id, item]));

  for (const seedItem of seedData.map((item) => normalizeLiveItem(item))) {
    if (!byId.has(seedItem.id)) {
      byId.set(seedItem.id, seedItem);
    }
  }

  for (const augment of AUGMENTS) {
    const existing = byId.get(augment.id);
    const augmentItem = {
      ...existing,
      id: augment.id,
      name: augment.name,
      type: existing?.type || 'Augment',
      recipe: augment.recipe || existing?.recipe || null,
      weightKg: existing?.weightKg ?? 2,
      value: existing?.value ?? 640,
      rarity: existing?.rarity || 'Augment',
      isSyntheticAugment: true,
    };
    byId.set(augment.id, augmentItem);
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeLiveItem(raw) {
  return {
    ...raw,
    id: raw.id,
    name: typeof raw.name === 'string' ? raw.name : raw.name?.en || prettifyId(raw.id),
    description: typeof raw.description === 'string' ? raw.description : raw.description?.en || raw.summary?.en || '',
    type: raw.type || raw.category || raw.subType || raw.class || 'Unknown',
    rarity: raw.rarity || 'Unknown',
    value: Number(raw.value ?? raw.cost ?? 0),
    weightKg: Number(raw.weightKg ?? raw.weight ?? 0),
    stackSize: Number(raw.stackSize ?? 1),
    recipe: raw.recipe || null,
    craftBench: Array.isArray(raw.craftBench) ? raw.craftBench : raw.craftBench ? [raw.craftBench] : [],
    stationLevelRequired: raw.stationLevelRequired || null,
    imageFilename: raw.imageFilename || raw.image || '',
    shieldTier: raw.shieldTier || null,
    attachmentCategory: raw.attachmentCategory || raw.modCategory || raw.slotCategory || raw.modSlot || null,
    attachmentSlots: raw.attachmentSlots || raw.modSlots || raw.slots || null,
    ammoType: raw.ammoType || raw.ammo?.type || raw.weaponStats?.ammoType || null,
    weaponFamily: raw.weaponFamily || raw.weaponClass || raw.class || null,
    compatibleWeaponIds: raw.compatibleWeaponIds || raw.compatibleItems || null,
    compatibleWeaponFamilies: raw.compatibleWeaponFamilies || raw.weaponTypes || null,
    compatibleAmmoClasses: raw.compatibleAmmoClasses || raw.ammoClasses || null,
    raw,
  };
}

function repairLoadoutReferences() {
  if (!state.currentLoadout) return;
  state.currentLoadout = normalizeLoadout(state.currentLoadout);
  for (const [name, saved] of Object.entries(state.savedLoadouts)) {
    state.savedLoadouts[name] = normalizeLoadout(saved);
  }
}

function renderAll() {
  renderSavedLoadoutOptions();
  renderAugmentOptions();
  renderBoard();
  renderMobileBoardNav();
  renderCraftSummary();
  renderSelectorModal();
  persistAppState();
}

function renderMobileBoardNav() {
  if (!dom.loadoutBoard) return;
  dom.loadoutBoard.dataset.mobilePanel = state.mobilePanel || 'equipment';
  dom.mobilePanelButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.mobilePanel === (state.mobilePanel || 'equipment'));
  });
}

function renderAugmentOptions() {
  const options = AUGMENTS.map((augment) => `<option value="${augment.id}">${escapeHtml(augment.name)}</option>`).join('');
  dom.augmentSelect.innerHTML = options;
  dom.augmentSelect.value = state.currentLoadout?.augmentId || 'looting_mk_2';
}

function renderSavedLoadoutOptions() {
  const names = Object.keys(state.savedLoadouts).sort((a, b) => a.localeCompare(b));
  const options = ['<option value="">Select saved loadout…</option>']
    .concat(names.map((name) => `<option value="${escapeAttribute(name)}">${escapeHtml(name)}</option>`));
  dom.savedLoadoutSelect.innerHTML = options.join('');
  dom.savedLoadoutSelect.value = names.includes(state.activeSavedName) ? state.activeSavedName : '';
}

function renderBoard() {
  const loadout = state.currentLoadout;
  const augment = augmentMap[loadout.augmentId] || AUGMENTS[0];
  dom.loadoutNameInput.value = loadout.name || '';
  dom.equipmentSubtitle.textContent = `${augment.name} · ${state.catalogSource === 'live' ? 'live catalog' : state.catalogSource === 'cache' ? 'cached catalog' : 'fallback data'}`;
  dom.backpackCountLabel.textContent = `0/${augment.backpackSlots}`;
  dom.quickUseCountLabel.textContent = `${filledCount(loadout.quickUse, augment.quickUseSlots)}/${augment.quickUseSlots}`;
  dom.safePocketCountLabel.textContent = `${filledCount(loadout.safePocket, augment.safePocketSlots)}/${augment.safePocketSlots}`;

  const totals = computeTotals(loadout, augment);
  dom.weightValue.textContent = `${totals.weight.toFixed(1)} / ${augment.weightLimit.toFixed(1)}`;
  dom.valueValue.textContent = totals.value.toLocaleString();
  dom.selectedItemCount.textContent = totals.selectedItems.toString();
  dom.backpackCountLabel.textContent = `${filledCount(loadout.backpack, augment.backpackSlots)}/${augment.backpackSlots}`;

  renderAugmentMeta(augment, totals);
  renderSingleSlot(dom.augmentSlotMount, {
    kind: 'augment',
    label: 'Augment',
    itemId: loadout.augmentId,
    qty: 1,
    disabled: false,
    compact: false,
    onClick: () => openSelector({ kind: 'augment' }),
  });
  renderSingleSlot(dom.shieldSlotMount, {
    kind: 'shield',
    label: 'Shield',
    itemId: loadout.shield?.itemId || null,
    qty: loadout.shield?.qty || 1,
    disabled: false,
    compact: false,
    onClick: () => openSelector({ kind: 'shield' }),
    allowQuantity: false,
  });

  renderWeapons(loadout.weapons);
  renderBackpack(loadout.backpack, augment.backpackSlots);
  renderQuickUse(loadout.quickUse, augment.quickUseSlots);
  renderIntegratedTool(augment);
  renderAugmentedSlots(loadout.augmented, augment);
  renderSafePocket(loadout.safePocket, augment.safePocketSlots);
  renderOverflowNotice();
}

function renderAugmentMeta(augment, totals) {
  const chips = [
    `Weight cap · ${augment.weightLimit}`,
    `Shields · ${augment.shieldCompatibility.join(', ')}`,
    `Backpack · ${augment.backpackSlots}`,
    `Quick Use · ${augment.quickUseSlots}`,
    `Safe Pocket · ${augment.safePocketSlots}`,
  ];
  if (augment.integratedTool) chips.push(`Integrated · ${augment.integratedTool}`);
  if (augment.augmentedSlots.length) {
    chips.push(...augment.augmentedSlots.map((slot) => `${slot.label} · ${slot.count}`));
  }
  if (totals.weight > augment.weightLimit) chips.push(`Over cap · +${(totals.weight - augment.weightLimit).toFixed(1)} kg`);
  dom.augmentMeta.innerHTML = chips.map((chip) => `<span class="meta-chip">${escapeHtml(chip)}</span>`).join('');
}

function renderSingleSlot(container, config) {
  container.innerHTML = '';
  const element = makeSlotButton(config);
  container.appendChild(element);
}

function renderWeapons(weapons) {
  dom.weaponSlotsMount.innerHTML = '';
  weapons.forEach((weaponEntry, index) => {
    const weapon = weaponEntry?.itemId ? getItem(weaponEntry.itemId) : null;
    const card = document.createElement('div');
    card.className = 'weapon-card';
    const slots = weapon ? guessAttachmentSlotsForWeapon(weapon) : defaultAttachmentSlotsForUnknown(index);
    card.innerHTML = `
      <div class="weapon-card-header">
        <div>
          <p class="weapon-rank">Weapon ${index + 1}</p>
          <h4 class="weapon-name">${escapeHtml(weapon?.name || 'Select weapon')}</h4>
        </div>
        <button class="ghost-btn" type="button">${weapon ? 'Swap' : 'Select'}</button>
      </div>
      <button class="ghost-btn" type="button" style="display:none"></button>
      <div class="weapon-art"></div>
      <div class="weapon-attachments"></div>
      <div class="weapon-card-footer"></div>
    `;
    const selectButton = card.querySelector('.ghost-btn');
    const art = card.querySelector('.weapon-art');
    const attachmentsWrap = card.querySelector('.weapon-attachments');
    const footer = card.querySelector('.weapon-card-footer');
    selectButton.addEventListener('click', () => openSelector({ kind: 'weapon', index }));
    if (weapon?.imageFilename) art.style.backgroundImage = `url('${weapon.imageFilename}')`;
    else art.textContent = '';
    slots.forEach((slotKind) => {
      const attachmentId = weaponEntry?.attachments?.[slotKind] || null;
      const attachment = attachmentId ? getItem(attachmentId) : null;
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'attachment-pill';
      pill.innerHTML = `<small>${escapeHtml(ATTACHMENT_SLOT_LABELS[slotKind] || slotKind)}</small><strong>${escapeHtml(attachment?.name || 'Empty')}</strong>`;
      pill.disabled = !weapon;
      if (!weapon) pill.style.opacity = '0.45';
      pill.addEventListener('click', () => openSelector({ kind: 'attachment', index, attachmentKind: slotKind }));
      attachmentsWrap.appendChild(pill);
    });
    footer.innerHTML = weapon
      ? `<span>${weapon.rarity}</span><span>${formatWeight(weapon.weightKg)} · ${formatValue(weapon.value)}</span>`
      : '<span class="weapon-rank">Choose a weapon to unlock attachment slots</span>';
    dom.weaponSlotsMount.appendChild(card);
  });
}

function defaultAttachmentSlotsForUnknown(index) {
  return index === 0 ? ['muzzle', 'magazine'] : ['muzzle', 'underbarrel', 'magazine', 'stock'];
}

function renderBackpack(entries, activeSlots) {
  renderGrid(dom.backpackGrid, entries, activeSlots, MAX_BACKPACK_SLOTS, (index) => ({
    kind: 'backpack',
    label: `Slot ${index + 1}`,
    itemId: entries[index]?.itemId || null,
    qty: entries[index]?.qty || 1,
    compact: true,
    disabled: index >= activeSlots,
    onClick: index >= activeSlots ? null : () => openSelector({ kind: 'backpack', index }),
    onAdjust: index >= activeSlots ? null : (delta) => adjustStackQuantity('backpack', index, delta),
  }));
}

function renderQuickUse(entries, activeSlots) {
  renderGrid(dom.quickUseGrid, entries, activeSlots, MAX_QUICK_SLOTS, (index) => ({
    kind: 'quick',
    label: `Quick ${index + 1}`,
    itemId: entries[index]?.itemId || null,
    qty: entries[index]?.qty || 1,
    compact: true,
    disabled: index >= activeSlots,
    onClick: index >= activeSlots ? null : () => openSelector({ kind: 'quick', index }),
    onAdjust: index >= activeSlots ? null : (delta) => adjustStackQuantity('quickUse', index, delta),
  }));
}

function renderSafePocket(entries, activeSlots) {
  renderGrid(dom.safePocketGrid, entries, activeSlots, MAX_SAFE_SLOTS, (index) => ({
    kind: 'safe',
    label: `Pocket ${index + 1}`,
    itemId: entries[index]?.itemId || null,
    qty: entries[index]?.qty || 1,
    compact: true,
    disabled: index >= activeSlots,
    onClick: index >= activeSlots ? null : () => openSelector({ kind: 'safe', index }),
    onAdjust: index >= activeSlots ? null : (delta) => adjustStackQuantity('safePocket', index, delta),
  }));
}

function renderGrid(container, entries, activeSlots, totalSlots, configFactory) {
  container.innerHTML = '';
  for (let index = 0; index < totalSlots; index += 1) {
    const button = makeSlotButton(configFactory(index));
    container.appendChild(button);
  }
}

function renderIntegratedTool(augment) {
  if (!augment.integratedTool) {
    dom.integratedToolMount.innerHTML = '';
    return;
  }
  dom.integratedToolMount.innerHTML = `
    <div class="integrated-tool">
      <p>Integrated Tool</p>
      <strong>${escapeHtml(augment.integratedTool)}</strong>
      <span class="subtle">Always active with this augment.</span>
    </div>
  `;
}

function renderAugmentedSlots(entries, augment) {
  if (!augment.augmentedSlots.length) {
    dom.augmentSlotsMount.innerHTML = '';
    return;
  }
  const groups = [];
  let runningIndex = 0;
  augment.augmentedSlots.forEach((group) => {
    const cells = [];
    for (let index = 0; index < group.count; index += 1) {
      const slotIndex = runningIndex + index;
      const entry = entries[slotIndex];
      cells.push(makeSlotButton({
        kind: 'augmented',
        label: group.label,
        itemId: entry?.itemId || null,
        qty: entry?.qty || 1,
        compact: true,
        onClick: () => openSelector({ kind: 'augmented', index: slotIndex, augmentedKind: group.kind, label: group.label }),
        onAdjust: (delta) => adjustAugmentedQuantity(slotIndex, delta),
      }));
    }
    groups.push({ title: `${group.label} · ${group.count}`, cells });
    runningIndex += group.count;
  });
  dom.augmentSlotsMount.innerHTML = '';
  groups.forEach((group) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'augment-group';
    const title = document.createElement('h4');
    title.className = 'augment-group-title';
    title.textContent = group.title;
    const grid = document.createElement('div');
    grid.className = 'slot-grid slot-grid--safe';
    group.cells.forEach((cell) => grid.appendChild(cell));
    wrapper.append(title, grid);
    dom.augmentSlotsMount.appendChild(wrapper);
  });
}

function renderOverflowNotice() {
  if (!state.overflowBin.length) {
    dom.overflowNotice.classList.add('hidden');
    dom.overflowNotice.innerHTML = '';
    return;
  }
  const names = state.overflowBin.map((entry) => getItem(entry.itemId)?.name || prettifyId(entry.itemId));
  dom.overflowNotice.classList.remove('hidden');
  dom.overflowNotice.innerHTML = `<strong>Augment swap moved items out of range.</strong> ${escapeHtml(names.join(', '))}`;
}

function makeSlotButton(config) {
  const button = dom.slotTemplate.content.firstElementChild.cloneNode(true);
  const item = config.itemId ? getItem(config.itemId) : null;
  const art = button.querySelector('.slot-art');
  const label = button.querySelector('.slot-label');
  const name = button.querySelector('.slot-name');
  const qty = button.querySelector('.slot-qty');
  const meta = button.querySelector('.slot-meta');
  button.classList.add(`slot--${config.kind}`);
  if (config.compact) button.classList.add('is-compact');
  if (!item) button.classList.add('is-empty');
  if (config.disabled) button.classList.add('is-disabled');
  if (item?.imageFilename) art.style.backgroundImage = `url('${item.imageFilename}')`;
  label.textContent = config.label || SLOT_KIND_LABELS[config.kind] || 'Slot';
  name.textContent = item?.name || placeholderLabel(config.kind);
  qty.textContent = item ? `x${config.qty || 1}` : '';
  meta.textContent = item ? `${formatWeight(item.weightKg)} · ${formatValue(item.value)}` : 'Click to choose';
  if (config.onClick) {
    button.addEventListener('click', config.onClick);
  }
  if (item && config.onAdjust && item.stackSize > 1 && !config.disabled) {
    const row = document.createElement('div');
    row.className = 'adjust-row';
    row.innerHTML = `<button type="button" aria-label="Decrease">−</button><span>${config.qty || 1}/${item.stackSize}</span><button type="button" aria-label="Increase">+</button>`;
    const [minus, plus] = row.querySelectorAll('button');
    minus.addEventListener('click', (event) => {
      event.stopPropagation();
      config.onAdjust(-1);
    });
    plus.addEventListener('click', (event) => {
      event.stopPropagation();
      config.onAdjust(1);
    });
    button.appendChild(row);
  }
  return button;
}

function placeholderLabel(kind) {
  switch (kind) {
    case 'augment': return 'Choose augment';
    case 'shield': return 'Shield slot';
    case 'weapon': return 'Choose weapon';
    case 'quick': return 'Quick-use item';
    case 'augmented': return 'Augment item';
    case 'safe': return 'Pocket item';
    default: return 'Inventory item';
  }
}

function swapAugment(nextAugmentId) {
  const nextAugment = augmentMap[nextAugmentId];
  if (!nextAugment) return;
  const previous = state.currentLoadout;
  const next = normalizeLoadout({ ...previous, augmentId: nextAugment.id });
  state.overflowBin = [];

  const pruneRange = (entries, limit, label) => {
    for (let index = limit; index < entries.length; index += 1) {
      if (entries[index]?.itemId) state.overflowBin.push({ ...entries[index], area: label, index });
      entries[index] = null;
    }
  };

  pruneRange(next.backpack, nextAugment.backpackSlots, 'backpack');
  pruneRange(next.quickUse, nextAugment.quickUseSlots, 'quickUse');
  pruneRange(next.safePocket, nextAugment.safePocketSlots, 'safePocket');
  next.augmented.forEach((entry) => {
    if (!entry || !entry.itemId) return;
    if (!isEntryValidForAugmentedKind(entry.itemId, entry.kind)) {
      state.overflowBin.push({ ...entry, area: 'augmented' });
      entry.itemId = null;
      entry.qty = 1;
    }
  });

  if (next.shield?.itemId) {
    const shield = getItem(next.shield.itemId);
    const tier = shieldTier(shield);
    if (tier && !nextAugment.shieldCompatibility.includes(tier)) {
      state.overflowBin.push({ ...next.shield, area: 'shield' });
      next.shield = null;
    }
  }

  state.currentLoadout = next;
  renderAll();
}

function adjustStackQuantity(area, index, delta) {
  const entry = state.currentLoadout[area][index];
  if (!entry?.itemId) return;
  const item = getItem(entry.itemId);
  if (!item) return;
  entry.qty = clamp(entry.qty + delta, 1, item.stackSize || 1);
  renderAll();
}

function adjustAugmentedQuantity(index, delta) {
  const entry = state.currentLoadout.augmented[index];
  if (!entry?.itemId) return;
  const item = getItem(entry.itemId);
  if (!item) return;
  entry.qty = clamp(entry.qty + delta, 1, item.stackSize || 1);
  renderAll();
}

function openSelector(context) {
  state.modal.open = true;
  state.modal.context = context;
  state.modal.query = '';
  state.modal.filter = 'all';
  dom.selectorSearchInput.value = '';
  dom.selectorModal.classList.remove('hidden');
  dom.selectorModal.setAttribute('aria-hidden', 'false');
  renderSelectorModal();
  setTimeout(() => dom.selectorSearchInput.focus(), 20);
}

function closeModal() {
  state.modal.open = false;
  state.modal.context = null;
  dom.selectorModal.classList.add('hidden');
  dom.selectorModal.setAttribute('aria-hidden', 'true');
}

function renderSelectorModal() {
  if (!state.modal.open || !state.modal.context) return;
  const { context } = state.modal;
  const allowedItems = getAllowedItemsForContext(context);
  const groupCounts = new Map();
  allowedItems.forEach((item) => {
    const group = selectorGroupForItem(context, item);
    groupCounts.set(group, (groupCounts.get(group) || 0) + 1);
  });
  const availableFilters = ['all', ...[...groupCounts.keys()].sort()];
  if (!availableFilters.includes(state.modal.filter)) state.modal.filter = 'all';
  dom.selectorTitle.textContent = selectorTitleForContext(context);
  dom.selectorSubtitle.textContent = selectorSubtitleForContext(context, allowedItems.length);
  dom.selectorFilterChips.innerHTML = availableFilters.map((filter) => `
    <button type="button" class="filter-chip ${state.modal.filter === filter ? 'is-active' : ''}" data-filter="${escapeAttribute(filter)}">
      ${escapeHtml(filter === 'all' ? 'All' : `${filter} (${groupCounts.get(filter) || 0})`)}
    </button>
  `).join('');
  dom.selectorFilterChips.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.modal.filter = button.dataset.filter;
      renderSelectorModal();
    });
  });

  const filtered = allowedItems.filter((item) => {
    const query = state.modal.query.trim().toLowerCase();
    const matchesFilter = state.modal.filter === 'all' || selectorGroupForItem(context, item) === state.modal.filter;
    if (!matchesFilter) return false;
    if (!query) return true;
    const haystack = [
      item.name,
      item.type,
      item.rarity,
      item.description,
      ...Object.keys(item.recipe || {}).map((ingredientId) => getItem(ingredientId)?.name || ingredientId),
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  });

  if (!filtered.length) {
    dom.selectorResults.innerHTML = `<div class="empty-state">No items match this slot and filter.</div>`;
  } else {
    dom.selectorResults.innerHTML = '';
    filtered.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'selector-item';
      button.innerHTML = `
        <div class="selector-item-art" style="background-image:url('${escapeAttribute(item.imageFilename || '')}')"></div>
        <small>${escapeHtml(item.rarity)} · ${escapeHtml(item.type)}</small>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(recipeSnippet(item))}</small>
        <footer><span>${formatWeight(item.weightKg)}</span><span>${formatValue(item.value)}</span></footer>
      `;
      button.addEventListener('click', () => assignSelection(context, item));
      dom.selectorResults.appendChild(button);
    });
  }
}

function clearModalTarget() {
  if (!state.modal.context) return;
  clearSelection(state.modal.context);
  closeModal();
  renderAll();
}

function assignSelection(context, item) {
  if (!item) return;
  switch (context.kind) {
    case 'augment':
      swapAugment(item.id);
      closeModal();
      return;
    case 'shield':
      state.currentLoadout.shield = { itemId: item.id, qty: 1 };
      break;
    case 'weapon':
      state.currentLoadout.weapons[context.index] = { itemId: item.id, attachments: {} };
      break;
    case 'attachment':
      state.currentLoadout.weapons[context.index].attachments[context.attachmentKind] = item.id;
      break;
    case 'backpack':
      state.currentLoadout.backpack[context.index] = { itemId: item.id, qty: 1 };
      break;
    case 'quick':
      state.currentLoadout.quickUse[context.index] = { itemId: item.id, qty: 1 };
      break;
    case 'safe':
      state.currentLoadout.safePocket[context.index] = { itemId: item.id, qty: 1 };
      break;
    case 'augmented':
      state.currentLoadout.augmented[context.index] = {
        ...state.currentLoadout.augmented[context.index],
        itemId: item.id,
        qty: 1,
      };
      break;
    default:
      break;
  }
  closeModal();
  renderAll();
}

function clearSelection(context) {
  switch (context.kind) {
    case 'shield':
      state.currentLoadout.shield = null;
      break;
    case 'weapon':
      state.currentLoadout.weapons[context.index] = { itemId: null, attachments: {} };
      break;
    case 'attachment':
      delete state.currentLoadout.weapons[context.index].attachments[context.attachmentKind];
      break;
    case 'backpack':
      state.currentLoadout.backpack[context.index] = null;
      break;
    case 'quick':
      state.currentLoadout.quickUse[context.index] = null;
      break;
    case 'safe':
      state.currentLoadout.safePocket[context.index] = null;
      break;
    case 'augmented':
      state.currentLoadout.augmented[context.index] = {
        ...state.currentLoadout.augmented[context.index],
        itemId: null,
        qty: 1,
      };
      break;
    default:
      break;
  }
}

function selectorTitleForContext(context) {
  switch (context.kind) {
    case 'augment': return 'Select augment';
    case 'shield': return 'Select shield';
    case 'weapon': return `Select weapon ${context.index + 1}`;
    case 'attachment': return `Select ${ATTACHMENT_SLOT_LABELS[context.attachmentKind] || context.attachmentKind}`;
    case 'backpack': return `Select backpack item · Slot ${context.index + 1}`;
    case 'quick': return `Select quick-use item · Slot ${context.index + 1}`;
    case 'safe': return `Select safe-pocket item · Slot ${context.index + 1}`;
    case 'augmented': return `Select ${context.label || 'augmented'} item`;
    default: return 'Select item';
  }
}

function selectorSubtitleForContext(context, count) {
  if (context.kind === 'attachment') {
    const weapon = getItem(state.currentLoadout.weapons[context.index]?.itemId);
    return `${count} matching items for ${ATTACHMENT_SLOT_LABELS[context.attachmentKind] || context.attachmentKind}${weapon ? ` · ${weapon.name}` : ''}`;
  }
  if (context.kind === 'shield') {
    const augment = augmentMap[state.currentLoadout.augmentId];
    return `${count} compatible shields for ${augment.name}`;
  }
  return `${count} matching items`;
}

function getAllowedItemsForContext(context) {
  switch (context.kind) {
    case 'augment':
      return AUGMENTS.map((augment) => getItem(augment.id)).filter(Boolean);
    case 'shield': {
      const allowedTiers = augmentMap[state.currentLoadout.augmentId]?.shieldCompatibility || [];
      return state.items.filter((item) => isShield(item) && isShieldCompatible(item, allowedTiers));
    }
    case 'weapon':
      return state.items.filter((item) => isWeapon(item));
    case 'attachment': {
      const weapon = getItem(state.currentLoadout.weapons[context.index]?.itemId);
      return state.items.filter((item) => isAttachmentCompatible(item, weapon, context.attachmentKind));
    }
    case 'quick':
      return state.items.filter((item) => isQuickUseEligible(item));
    case 'backpack':
      return state.items.filter((item) => isBackpackEligible(item));
    case 'safe':
      return state.items.filter((item) => isSafePocketEligible(item));
    case 'augmented':
      return state.items.filter((item) => isEntryValidForAugmentedKind(item.id, context.augmentedKind));
    default:
      return [];
  }
}

function selectorGroupForItem(context, item) {
  if (context.kind === 'attachment') return ATTACHMENT_SLOT_LABELS[inferAttachmentCategory(item)] || 'Other';
  if (context.kind === 'weapon') return item.type || 'Weapon';
  if (context.kind === 'shield') return shieldTier(item) || 'Shield';
  if (context.kind === 'augmented') return item.type || 'Item';
  return item.type || 'Item';
}

function isWeapon(item) {
  const typeText = `${item.type} ${item.weaponFamily || ''} ${item.raw?.weaponClass || ''} ${item.ammoType || ''}`.toLowerCase();
  if (isAttachment(item) || isShield(item) || isAugmentItem(item)) return false;
  if (item.ammoType || item.raw?.ammoType || item.raw?.magazineSize || item.raw?.weaponStats) return true;
  return [
    'assault rifle',
    'battle rifle',
    'hand cannon',
    'pistol',
    'smg',
    'sniper',
    'shotgun',
    'marksman',
    'machine gun',
    'carbine',
    'weapon',
  ].some((keyword) => typeText.includes(keyword));
}

function isShield(item) {
  return `${item.type} ${item.name}`.toLowerCase().includes('shield') && !`${item.name}`.toLowerCase().includes('recharger');
}

function shieldTier(item) {
  if (!item) return null;
  if (item.shieldTier) return item.shieldTier;
  const text = `${item.type} ${item.name}`.toLowerCase();
  if (text.includes('heavy')) return 'Heavy';
  if (text.includes('medium')) return 'Medium';
  if (text.includes('light')) return 'Light';
  return null;
}

function isShieldCompatible(item, allowedTiers) {
  const tier = shieldTier(item);
  if (!tier) return true;
  return allowedTiers.includes(tier);
}

function isAugmentItem(item) {
  return item.type === 'Augment' || augmentMap[item.id];
}

function isAttachment(item) {
  return Boolean(inferAttachmentCategory(item));
}

function inferAttachmentCategory(item) {
  if (!item) return null;
  if (item.attachmentCategory) return normalizeAttachmentCategory(item.attachmentCategory);
  const raw = item.raw || {};
  const category = raw.attachmentCategory || raw.modCategory || raw.slotCategory || raw.modSlot || raw.slot || raw.modType;
  if (typeof category === 'string') {
    const normalized = normalizeAttachmentCategory(category);
    if (normalized) return normalized;
  }
  const text = `${item.name} ${item.type} ${item.description}`.toLowerCase();
  if (/shotgun[-\s]?mag/.test(text)) return 'shotgun_magazine';
  if (/light[-\s]?mag/.test(text)) return 'light_magazine';
  if (/medium[-\s]?mag/.test(text)) return 'medium_magazine';
  if (/heavy[-\s]?mag/.test(text)) return 'heavy_magazine';
  if (/tech[-\s]?mod|kinetic converter|splitter/.test(text)) return 'tech';
  if (/shotgun[-\s]?muzzle|shotgun choke|choke/.test(text)) return 'shotgun_muzzle';
  if (/muzzle|silencer|suppressor|brake|compensator|barrel/.test(text)) return 'muzzle';
  if (/grip|underbarrel|foregrip|laser/.test(text)) return 'underbarrel';
  if (/stock/.test(text)) return 'stock';
  if (/scope|optic|sight/.test(text)) return 'optic';
  return null;
}

function normalizeAttachmentCategory(value) {
  const lowered = `${value}`.toLowerCase().replace(/_/g, ' ').trim();
  if (lowered.includes('shotgun') && lowered.includes('mag')) return 'shotgun_magazine';
  if (lowered.includes('light') && lowered.includes('mag')) return 'light_magazine';
  if (lowered.includes('medium') && lowered.includes('mag')) return 'medium_magazine';
  if (lowered.includes('heavy') && lowered.includes('mag')) return 'heavy_magazine';
  if (lowered.includes('shotgun') && (lowered.includes('muzzle') || lowered.includes('choke'))) return 'shotgun_muzzle';
  if (lowered.includes('muzzle') || lowered.includes('barrel') || lowered.includes('silencer') || lowered.includes('compensator')) return 'muzzle';
  if (lowered.includes('under') || lowered.includes('grip')) return 'underbarrel';
  if (lowered.includes('stock')) return 'stock';
  if (lowered.includes('optic') || lowered.includes('sight') || lowered.includes('scope')) return 'optic';
  if (lowered.includes('tech')) return 'tech';
  if (lowered.includes('special')) return 'special';
  if (lowered === 'magazine' || lowered.endsWith(' mag')) return 'magazine';
  return null;
}

function normalizeAmmoClass(value) {
  const lowered = `${value || ''}`.toLowerCase();
  if (lowered.includes('shotgun')) return 'shotgun';
  if (lowered.includes('heavy')) return 'heavy';
  if (lowered.includes('medium')) return 'medium';
  if (lowered.includes('light')) return 'light';
  return null;
}

function inferWeaponAmmoClass(item) {
  const raw = item?.raw || {};
  const text = `${item?.ammoType || ''} ${raw.ammoType || ''} ${raw.ammo?.type || ''} ${item?.name || ''} ${item?.description || ''}`.toLowerCase();
  if (text.includes('shotgun')) return 'shotgun';
  if (text.includes('heavy')) return 'heavy';
  if (text.includes('medium')) return 'medium';
  if (text.includes('light')) return 'light';
  return null;
}

function inferWeaponFamily(item) {
  const raw = item?.raw || {};
  const text = `${item?.weaponFamily || ''} ${raw.weaponFamily || ''} ${raw.weaponClass || ''} ${item?.type || ''} ${item?.name || ''}`.toLowerCase();
  if (text.includes('hand cannon')) return 'hand cannon';
  if (text.includes('assault rifle')) return 'assault rifle';
  if (text.includes('battle rifle')) return 'battle rifle';
  if (text.includes('sniper')) return 'sniper rifle';
  if (text.includes('shotgun')) return 'shotgun';
  if (text.includes('pistol')) return 'pistol';
  if (text.includes('smg')) return 'smg';
  return item?.type?.toLowerCase() || 'weapon';
}

function ammoToMagazineSlot(ammoClass) {
  if (ammoClass === 'light') return 'light_magazine';
  if (ammoClass === 'medium') return 'medium_magazine';
  if (ammoClass === 'heavy') return 'heavy_magazine';
  if (ammoClass === 'shotgun') return 'shotgun_magazine';
  return null;
}

function guessAttachmentSlotsForWeapon(weapon) {
  if (!weapon) return [];
  const raw = weapon.raw || {};
  const direct = raw.attachmentSlots || raw.modSlots || raw.slots || weapon.attachmentSlots;
  const parsed = parseAttachmentSlots(direct);
  if (parsed.length) return parsed;

  const family = inferWeaponFamily(weapon);
  const ammoClass = inferWeaponAmmoClass(weapon);
  const description = `${weapon.description || ''} ${raw.firingMode || ''}`.toLowerCase();
  const ammoSlot = ammoToMagazineSlot(ammoClass);

  if (family === 'hand cannon') return ['muzzle', 'tech'];
  if (family === 'pistol') return ammoSlot ? ['muzzle', ammoSlot] : ['muzzle'];
  if (family === 'shotgun' || description.includes('pump-action')) return ['shotgun_muzzle', 'underbarrel', 'shotgun_magazine', 'stock'];
  if (description.includes('break-action')) return ['muzzle', 'underbarrel', 'stock'];
  if (description.includes('lever-action')) return ammoSlot ? ['muzzle', ammoSlot, 'stock'] : ['muzzle', 'stock'];
  if (family === 'assault rifle' || family === 'battle rifle' || family === 'sniper rifle' || family === 'smg') {
    return ['muzzle', 'underbarrel', ...(ammoSlot ? [ammoSlot] : []), 'stock'];
  }
  return ['muzzle', 'underbarrel', ...(ammoSlot ? [ammoSlot] : []), 'stock'];
}

function parseAttachmentSlots(slots) {
  if (!slots) return [];
  const rawSlots = Array.isArray(slots)
    ? slots
    : typeof slots === 'object'
      ? Object.keys(slots)
      : `${slots}`.split(',');
  return rawSlots
    .map((slot) => normalizeAttachmentCategory(`${slot}`))
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
}

function compatibilityTokens(source) {
  if (!source) return [];
  if (Array.isArray(source)) return source.flatMap((entry) => compatibilityTokens(entry));
  if (typeof source === 'object') return Object.keys(source).flatMap((entry) => compatibilityTokens(entry));
  return `${source}`
    .split(/[,;|]/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function normalizedWeaponKey(value) {
  return `${value || ''}`
    .toLowerCase()
    .replace(/\b(i|ii|iii|iv|v)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function descriptionCompatibilityTokens(item) {
  const text = `${item?.description || ''}`;
  const match = text.match(/compatible with\s*:\s*([^\.\n]+)/i);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((value) => normalizedWeaponKey(value))
    .filter(Boolean);
}

function slotAcceptsAttachment(weapon, attachmentKind, itemCategory) {
  const slots = guessAttachmentSlotsForWeapon(weapon);
  if (!slots.length) return false;
  return slots.some((slot) => {
    if (slot === attachmentKind) return true;
    if (slot === 'magazine' && itemCategory.endsWith('_magazine')) return true;
    if (slot.endsWith('_magazine') && attachmentKind === 'magazine') return true;
    return false;
  });
}

function isAttachmentCompatible(item, weapon, attachmentKind) {
  if (!item || !weapon) return false;
  const itemCategory = inferAttachmentCategory(item);
  if (!itemCategory) return false;
  if (itemCategory !== attachmentKind && !(attachmentKind === 'magazine' && itemCategory.endsWith('_magazine'))) return false;
  if (!slotAcceptsAttachment(weapon, attachmentKind, itemCategory)) return false;

  const weaponNameKey = normalizedWeaponKey(weapon.name);
  const weaponIdKey = `${weapon.id || ''}`.toLowerCase();
  const family = inferWeaponFamily(weapon);
  const ammoClass = inferWeaponAmmoClass(weapon);

  if (itemCategory === 'shotgun_muzzle' && ammoClass !== 'shotgun') return false;
  if (itemCategory === 'muzzle' && ammoClass === 'shotgun') return false;
  if (itemCategory.endsWith('_magazine') && ammoToMagazineSlot(ammoClass) !== itemCategory) return false;

  const raw = item.raw || {};
  const explicitWeaponIds = [
    ...compatibilityTokens(item.compatibleWeaponIds),
    ...compatibilityTokens(raw.compatibleWeaponIds),
    ...compatibilityTokens(raw.compatibleWeapons),
    ...compatibilityTokens(raw.supportedWeapons),
    ...descriptionCompatibilityTokens(item),
  ].map(normalizedWeaponKey);

  const explicitFamilies = [
    ...compatibilityTokens(item.compatibleWeaponFamilies),
    ...compatibilityTokens(raw.compatibleWeaponFamilies),
    ...compatibilityTokens(raw.weaponTypes),
  ].map((value) => value.replace(/_/g, ' ').trim());

  const explicitAmmo = [
    ...compatibilityTokens(item.compatibleAmmoClasses),
    ...compatibilityTokens(raw.compatibleAmmoClasses),
    ...compatibilityTokens(raw.ammoClasses),
  ].map(normalizeAmmoClass).filter(Boolean);

  if (explicitWeaponIds.length && !explicitWeaponIds.some((token) => token === weaponNameKey || token === weaponIdKey || weaponNameKey.includes(token))) {
    return false;
  }
  if (explicitFamilies.length && !explicitFamilies.some((token) => family.includes(token) || token.includes(family))) {
    return false;
  }
  if (explicitAmmo.length && !explicitAmmo.includes(ammoClass)) {
    return false;
  }

  return true;
}

function isQuickUseEligible(item) {
  const text = `${item.type} ${item.name}`.toLowerCase();
  if (isWeapon(item) || isShield(item) || isAugmentItem(item) || isAttachment(item)) return false;
  return ['quick use', 'healing', 'grenade', 'deployable utility', 'utility', 'trap'].some((keyword) => text.includes(keyword));
}

function isBackpackEligible(item) {
  if (isAugmentItem(item) || isShield(item) || isWeapon(item) || isAttachment(item)) return false;
  return true;
}

function isSafePocketEligible(item) {
  if (isAugmentItem(item) || isShield(item) || isWeapon(item)) return false;
  return true;
}

function isEntryValidForAugmentedKind(itemId, kind) {
  const item = getItem(itemId);
  if (!item) return false;
  const text = `${item.type} ${item.name}`.toLowerCase();
  if (kind === 'grenade') return text.includes('grenade');
  if (kind === 'trinket') return text.includes('trinket');
  if (kind === 'deployable_utility') return ['deployable utility', 'utility', 'trap'].some((keyword) => text.includes(keyword));
  if (kind === 'healing') return ['healing', 'quick use', 'bandage', 'adrenaline', 'stim'].some((keyword) => text.includes(keyword));
  return false;
}

function computeTotals(loadout, augment) {
  const selections = getAllSelections(loadout, augment);
  return selections.reduce((totals, selection) => {
    const item = getItem(selection.itemId);
    if (!item) return totals;
    totals.weight += item.weightKg * selection.qty;
    totals.value += item.value * selection.qty;
    totals.selectedItems += selection.qty;
    return totals;
  }, { weight: 0, value: 0, selectedItems: 0 });
}

function getAllSelections(loadout, augment) {
  const selections = [];
  selections.push({ area: 'augment', label: 'Augment', itemId: loadout.augmentId, qty: 1 });
  if (loadout.shield?.itemId) selections.push({ area: 'shield', label: 'Shield', itemId: loadout.shield.itemId, qty: loadout.shield.qty || 1 });
  loadout.weapons.forEach((weapon, index) => {
    if (!weapon?.itemId) return;
    selections.push({ area: 'weapon', label: `Weapon ${index + 1}`, itemId: weapon.itemId, qty: 1 });
    Object.entries(weapon.attachments || {}).forEach(([attachmentKind, itemId]) => {
      if (!itemId) return;
      selections.push({ area: 'attachment', label: `Weapon ${index + 1} · ${ATTACHMENT_SLOT_LABELS[attachmentKind] || attachmentKind}`, itemId, qty: 1 });
    });
  });
  loadout.backpack.slice(0, augment.backpackSlots).forEach((entry, index) => {
    if (entry?.itemId) selections.push({ area: 'backpack', label: `Backpack ${index + 1}`, itemId: entry.itemId, qty: entry.qty || 1 });
  });
  loadout.quickUse.slice(0, augment.quickUseSlots).forEach((entry, index) => {
    if (entry?.itemId) selections.push({ area: 'quick', label: `Quick ${index + 1}`, itemId: entry.itemId, qty: entry.qty || 1 });
  });
  loadout.augmented.forEach((entry, index) => {
    if (entry?.itemId) selections.push({ area: 'augmented', label: `${entry.label || 'Augmented'} ${index + 1}`, itemId: entry.itemId, qty: entry.qty || 1 });
  });
  loadout.safePocket.slice(0, augment.safePocketSlots).forEach((entry, index) => {
    if (entry?.itemId) selections.push({ area: 'safe', label: `Safe Pocket ${index + 1}`, itemId: entry.itemId, qty: entry.qty || 1 });
  });
  return selections;
}

function renderCraftSummary() {
  const augment = augmentMap[state.currentLoadout.augmentId] || AUGMENTS[0];
  const selections = getAllSelections(state.currentLoadout, augment);
  const plan = buildCraftPlan(selections);
  renderTokenList(dom.basePartsList, plan.baseParts, 'token');
  renderTokenList(dom.craftedPartsList, plan.craftedIntermediates, 'token token--secondary');
  dom.basePartCount.textContent = summarizePartList(plan.baseParts);
  dom.craftedPartCount.textContent = summarizePartList(plan.craftedIntermediates);
  renderDependencyTree(plan.trees);
}

function summarizePartList(list) {
  const total = list.reduce((sum, entry) => sum + entry.qty, 0);
  return `${list.length} unique · ${total} total`;
}

function buildCraftPlan(selections) {
  const baseMap = new Map();
  const craftedMap = new Map();
  const trees = [];

  const addToMap = (map, itemId, qty) => {
    map.set(itemId, (map.get(itemId) || 0) + qty);
  };

  const visit = (itemId, qty, mode = 'intermediate') => {
    const item = getItem(itemId);
    if (!item) {
      addToMap(baseMap, itemId, qty);
      return { itemId, qty, bench: '', children: [], missing: true };
    }
    const recipe = normalizedRecipe(item);
    const node = {
      itemId,
      qty,
      bench: craftBenchLabel(item),
      children: [],
      missing: false,
    };
    if (!recipe.length) {
      addToMap(baseMap, itemId, qty);
      return node;
    }
    if (mode === 'intermediate') addToMap(craftedMap, itemId, qty);
    recipe.forEach(({ ingredientId, amount }) => {
      node.children.push(visit(ingredientId, amount * qty, 'intermediate'));
    });
    return node;
  };

  selections.forEach((selection) => {
    const item = getItem(selection.itemId);
    const tree = {
      label: selection.label,
      itemId: selection.itemId,
      qty: selection.qty,
      bench: item ? craftBenchLabel(item) : '',
      children: [],
    };
    const recipe = item ? normalizedRecipe(item) : [];
    if (!recipe.length) {
      addToMap(baseMap, selection.itemId, selection.qty);
    } else {
      recipe.forEach(({ ingredientId, amount }) => {
        tree.children.push(visit(ingredientId, amount * selection.qty, 'intermediate'));
      });
    }
    trees.push(tree);
  });

  const baseParts = sortedMapEntries(baseMap).map(([itemId, qty]) => ({ itemId, qty }));
  const craftedIntermediates = sortedMapEntries(craftedMap).map(([itemId, qty]) => ({ itemId, qty }));
  return { baseParts, craftedIntermediates, trees };
}

function normalizedRecipe(item) {
  if (!item?.recipe || typeof item.recipe !== 'object') return [];
  return Object.entries(item.recipe).map(([ingredientId, amount]) => ({ ingredientId, amount: Number(amount) || 0 })).filter((entry) => entry.amount > 0);
}

function renderTokenList(container, list, className) {
  if (!list.length) {
    container.innerHTML = '<div class="empty-state">Nothing to craft for the current selection.</div>';
    return;
  }
  container.innerHTML = '';
  list.forEach((entry) => {
    const item = getItem(entry.itemId);
    const chip = document.createElement('div');
    chip.className = className;
    chip.innerHTML = `
      <div class="token-art" style="background-image:url('${escapeAttribute(item?.imageFilename || '')}')"></div>
      <div class="token-copy">
        <strong>${escapeHtml(item?.name || prettifyId(entry.itemId))} × ${entry.qty}</strong>
        <small>${escapeHtml(item?.type || 'Unknown')}</small>
      </div>
    `;
    container.appendChild(chip);
  });
}

function renderDependencyTree(trees) {
  dom.dependencyTree.innerHTML = '';
  if (!trees.length) {
    dom.dependencyTree.innerHTML = '<div class="empty-state">Fill a few slots to generate the dependency tree.</div>';
    return;
  }
  trees.forEach((tree) => {
    const element = document.createElement('details');
    element.className = 'tree-node';
    element.open = true;
    element.innerHTML = `
      <summary>
        <div class="tree-title">
          <span>${escapeHtml(tree.label)}</span>
          <span>${escapeHtml(getItem(tree.itemId)?.name || prettifyId(tree.itemId))} × ${tree.qty}</span>
        </div>
        <small>${escapeHtml(tree.bench || 'No recipe')}</small>
      </summary>
      <div class="tree-children"></div>
    `;
    const childrenWrap = element.querySelector('.tree-children');
    if (!tree.children.length) {
      const leaf = document.createElement('div');
      leaf.className = 'tree-leaf';
      leaf.textContent = 'Base item or loot-only selection.';
      childrenWrap.appendChild(leaf);
    } else {
      tree.children.forEach((child) => childrenWrap.appendChild(renderDependencyNode(child)));
    }
    dom.dependencyTree.appendChild(element);
  });
}

function renderDependencyNode(node) {
  const item = getItem(node.itemId);
  if (!node.children.length) {
    const leaf = document.createElement('div');
    leaf.className = 'tree-leaf';
    leaf.innerHTML = `<strong>${escapeHtml(item?.name || prettifyId(node.itemId))} × ${node.qty}</strong> <span class="tree-bench">${escapeHtml(node.bench || 'Base material')}</span>`;
    return leaf;
  }
  const details = document.createElement('details');
  details.className = 'tree-node';
  details.innerHTML = `
    <summary>
      <div class="tree-title">
        <span>${escapeHtml(item?.name || prettifyId(node.itemId))} × ${node.qty}</span>
      </div>
      <small>${escapeHtml(node.bench || 'Crafted')}</small>
    </summary>
    <div class="tree-children"></div>
  `;
  const wrap = details.querySelector('.tree-children');
  node.children.forEach((child) => wrap.appendChild(renderDependencyNode(child)));
  return details;
}

function recipeSnippet(item) {
  const recipe = normalizedRecipe(item);
  if (!recipe.length) return 'No recipe in catalog';
  return recipe.slice(0, 3).map(({ ingredientId, amount }) => `${amount}× ${getItem(ingredientId)?.name || prettifyId(ingredientId)}`).join(' · ');
}

function craftBenchLabel(item) {
  const benches = item?.craftBench?.length ? item.craftBench.map(prettifyId).join(', ') : '';
  const level = item?.stationLevelRequired ? ` L${item.stationLevelRequired}` : '';
  return benches ? `${benches}${level}` : '';
}

function copyBaseParts() {
  const augment = augmentMap[state.currentLoadout.augmentId] || AUGMENTS[0];
  const plan = buildCraftPlan(getAllSelections(state.currentLoadout, augment));
  const text = plan.baseParts.map((entry) => `${entry.qty}x ${getItem(entry.itemId)?.name || prettifyId(entry.itemId)}`).join('\n');
  navigator.clipboard.writeText(text || 'No base parts required.');
}

function copyFullPlan() {
  const augment = augmentMap[state.currentLoadout.augmentId] || AUGMENTS[0];
  const selections = getAllSelections(state.currentLoadout, augment);
  const plan = buildCraftPlan(selections);
  const lines = [];
  lines.push(`Loadout: ${state.currentLoadout.name || augment.name}`);
  lines.push(`Augment: ${augment.name}`);
  lines.push('');
  lines.push('Base parts:');
  plan.baseParts.forEach((entry) => lines.push(`- ${entry.qty}x ${getItem(entry.itemId)?.name || prettifyId(entry.itemId)}`));
  lines.push('');
  lines.push('Crafted intermediates:');
  plan.craftedIntermediates.forEach((entry) => lines.push(`- ${entry.qty}x ${getItem(entry.itemId)?.name || prettifyId(entry.itemId)}`));
  navigator.clipboard.writeText(lines.join('\n'));
}

function saveCurrentLoadout() {
  const rawName = (dom.loadoutNameInput.value || state.currentLoadout.name || '').trim();
  const name = rawName || `${augmentMap[state.currentLoadout.augmentId]?.name || 'Loadout'} ${new Date().toLocaleString()}`;
  state.currentLoadout.name = name;
  state.savedLoadouts[name] = JSON.parse(JSON.stringify(state.currentLoadout));
  state.activeSavedName = name;
  renderAll();
}

function cloneCurrentLoadout() {
  const sourceName = (dom.loadoutNameInput.value || state.currentLoadout.name || 'Copied loadout').trim();
  let candidate = `${sourceName} Copy`;
  let index = 2;
  while (state.savedLoadouts[candidate]) {
    candidate = `${sourceName} Copy ${index}`;
    index += 1;
  }
  state.currentLoadout.name = candidate;
  state.savedLoadouts[candidate] = JSON.parse(JSON.stringify(state.currentLoadout));
  state.activeSavedName = candidate;
  renderAll();
}

function exportCurrentLoadout() {
  const blob = new Blob([JSON.stringify(state.currentLoadout, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${slugify(state.currentLoadout.name || 'arc-loadout')}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importLoadoutFromFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result || '{}'));
      state.currentLoadout = normalizeLoadout(payload);
      state.activeSavedName = '';
      renderAll();
    } catch (error) {
      console.error(error);
      alert('That file could not be imported.');
    }
    dom.importLoadoutInput.value = '';
  };
  reader.readAsText(file);
}

function loadSelectedSavedLoadout() {
  const name = dom.savedLoadoutSelect.value;
  if (!name || !state.savedLoadouts[name]) return;
  state.currentLoadout = normalizeLoadout(JSON.parse(JSON.stringify(state.savedLoadouts[name])));
  state.activeSavedName = name;
  renderAll();
}

function deleteSelectedSavedLoadout() {
  const name = dom.savedLoadoutSelect.value;
  if (!name || !state.savedLoadouts[name]) return;
  delete state.savedLoadouts[name];
  if (state.activeSavedName === name) state.activeSavedName = '';
  renderAll();
}

function filledCount(entries, limit) {
  return entries.slice(0, limit).filter((entry) => entry?.itemId).length;
}

function getItem(itemId) {
  return state.itemsById[itemId] || null;
}

function sortedMapEntries(map) {
  return [...map.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    const aName = getItem(a[0])?.name || a[0];
    const bName = getItem(b[0])?.name || b[0];
    return aName.localeCompare(bName);
  });
}

function formatWeight(weight) {
  return `${Number(weight || 0).toFixed(1)} kg`;
}

function formatValue(value) {
  return `${Number(value || 0).toLocaleString()} ¢`;
}

function prettifyId(value) {
  return `${value || ''}`.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugify(value) {
  return `${value}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  return document.cookie.split('; ').find((cookie) => cookie.startsWith(`${name}=`))?.split('=').slice(1).join('=') || '';
}

function escapeHtml(value) {
  return `${value ?? ''}`
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

init();
