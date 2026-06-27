import { useMemo, useState } from 'react';

type ResourceKey = 'food' | 'wood' | 'stone' | 'gold';

type BuildingUpgrade = {
  id: string;
  name: string;
  cost: Partial<Record<ResourceKey, number>>;
  health: string;
  popBonus?: number;
};

type Building = {
  id: string;
  name: string;
  space: number;
  cost: Partial<Record<ResourceKey, number>>;
  health: string;
  popBonus?: number;
  upgrade?: BuildingUpgrade;
  requiresTownhall2?: boolean;
};

type Unit = {
  id: string;
  name: string;
  popCost: number;
  cost: Partial<Record<ResourceKey, number>>;
  feast: number;
  health: string;
  damage: number;
  moveCost: number;
  special?: string;
};

type Tech = {
  id: string;
  name: string;
  levels: {
    cost: Partial<Record<ResourceKey, number>>;
    description: string;
    requiresTownhall2?: boolean;
  }[];
};

const initialResources: Record<ResourceKey, number> = {
  food: 3,
  wood: 0,
  stone: 0,
  gold: 0,
};

const basePopulationLimit = 0;

const buildings: Building[] = [
  {
    id: 'townhall',
    name: 'Townhall',
    space: 4,
    cost: { wood: 28, stone: 10 },
    health: '1-108',
    popBonus: 5,
    upgrade: {
      id: 'townhall2',
      name: 'Townhall level 2',
      cost: { wood: 10, stone: 20, gold: 10 },
      health: '1-120',
      popBonus: 5,
    },
  },
  {
    id: 'market',
    name: 'Market',
    space: 4,
    cost: { wood: 18 },
    health: '1-90',
  },
  {
    id: 'barracks',
    name: 'Barracks',
    space: 2,
    cost: { wood: 18 },
    health: '1-60',
  },
  {
    id: 'archery_range',
    name: 'Archery range',
    space: 4,
    cost: { wood: 18 },
    health: '1-72',
  },
  {
    id: 'stable',
    name: 'Stable',
    space: 5,
    cost: { wood: 18 },
    health: '1-78',
  },
  {
    id: 'siege_workshop',
    name: 'Siege workshop',
    space: 4,
    cost: { wood: 20 },
    health: '1-84',
  },
  {
    id: 'mill',
    name: 'Mill',
    space: 1,
    cost: { wood: 10 },
    health: '1-30',
    upgrade: {
      id: 'mill2',
      name: 'Mill level 2',
      cost: { wood: 6, stone: 4 },
      health: '1-36',
    },
  },
  {
    id: 'house',
    name: 'House',
    space: 1,
    cost: { wood: 3 },
    health: '1-24',
    popBonus: 5,
  },
  {
    id: 'blacksmith',
    name: 'Blacksmith',
    space: 1,
    cost: { wood: 15 },
    health: '1-48',
  },
  {
    id: 'university',
    name: 'University',
    space: 4,
    cost: { wood: 20 },
    health: '1-84',
  },
  {
    id: 'church',
    name: 'Church',
    space: 6,
    cost: { wood: 18, stone: 2 },
    health: '1-96',
    requiresTownhall2: true,
  },
  {
    id: 'castle',
    name: 'Castle',
    space: 9,
    cost: { stone: 65 },
    health: '1-144',
  },
  {
    id: 'tower',
    name: 'Tower',
    space: 2,
    cost: { wood: 3, stone: 13 },
    health: '1-78',
  },
  {
    id: 'wooden_wall',
    name: 'Wooden wall',
    space: 1,
    cost: { wood: 1 },
    health: '1-12',
  },
  {
    id: 'wooden_gate',
    name: 'Wooden gate',
    space: 1,
    cost: { wood: 3 },
    health: '1-18',
  },
  {
    id: 'stone_wall',
    name: 'Stone wall',
    space: 1,
    cost: { stone: 1 },
    health: '1-24',
  },
  {
    id: 'stone_gate',
    name: 'Stone gate',
    space: 1,
    cost: { stone: 3 },
    health: '1-36',
  },
];

const units: Unit[] = [
  {
    id: 'villager',
    name: 'Villager',
    popCost: 1,
    cost: { food: 5 },
    feast: 1,
    health: '1-6',
    damage: 1,
    moveCost: 1,
  },
  {
    id: 'swordman',
    name: 'Swordman',
    popCost: 4,
    cost: { food: 6, gold: 2 },
    feast: 2,
    health: '1-24',
    damage: 4,
    moveCost: 1,
    special: 'Shield',
  },
  {
    id: 'pikeman',
    name: 'Pikeman',
    popCost: 2,
    cost: { food: 4, wood: 4 },
    feast: 2,
    health: '1-18',
    damage: 5,
    moveCost: 1,
  },
  {
    id: 'archer',
    name: 'Archer',
    popCost: 2,
    cost: { food: 1, wood: 3, gold: 5 },
    feast: 1,
    health: '1-12',
    damage: 2,
    moveCost: 1,
    special: 'Firing depth',
  },
  {
    id: 'horseman',
    name: 'Horseman',
    popCost: 5,
    cost: { food: 6, gold: 8 },
    feast: 4,
    health: '1-36',
    damage: 3,
    moveCost: 2,
    special: 'Moving 5 tiles costs 2 actions',
  },
  {
    id: 'elephant_archer',
    name: 'Elephant archer',
    popCost: 6,
    cost: { food: 10, gold: 8 },
    feast: 5,
    health: '1-54',
    damage: 2,
    moveCost: 1,
    special: 'Damage 20 at the tile right in front of the elephant archer.',
  },
  {
    id: 'siege_ram',
    name: 'Siege Ram',
    popCost: 0,
    cost: { wood: 16, gold: 8 },
    feast: 0,
    health: '1-96',
    damage: 60,
    moveCost: 0,
  },
  {
    id: 'trebuchet',
    name: 'Trebuchet',
    popCost: 0,
    cost: { wood: 20, gold: 20 },
    feast: 0,
    health: '1-58',
    damage: 20,
    moveCost: 0,
  },
];

const techs: Tech[] = [
  {
    id: 'sword_sharpness',
    name: 'Sword Sharpness',
    levels: [
      { cost: { food: 15 }, description: '+1 sword damage' },
      { cost: { food: 22, gold: 22 }, description: '+1 sword damage', requiresTownhall2: true },
      { cost: { food: 28, gold: 22 }, description: '+1 sword damage' },
    ],
  },
  {
    id: 'shield',
    name: 'Shield',
    levels: [
      { cost: { food: 10, gold: 5 }, description: '+1 shield' },
      { cost: { food: 20, gold: 10 }, description: '+1 shield', requiresTownhall2: true },
      { cost: { food: 30, gold: 15 }, description: '+1 shield' },
    ],
  },
  {
    id: 'pike_sharpness',
    name: 'Pike Sharpness',
    levels: [
      { cost: { food: 10 }, description: '+1 pike damage' },
      { cost: { food: 15, gold: 5 }, description: '+1 pike damage', requiresTownhall2: true },
      { cost: { food: 20, gold: 10 }, description: '+1 pike damage' },
    ],
  },
  {
    id: 'bow_quality',
    name: 'Bow Quality',
    levels: [
      { cost: { food: 10, gold: 5 }, description: '-1 firing depth' },
      { cost: { food: 20, gold: 10 }, description: '-1 firing depth', requiresTownhall2: true },
    ],
  },
  {
    id: 'arrow_sharpness',
    name: 'Arrow Sharpness',
    levels: [
      { cost: { food: 10, gold: 5 }, description: '+1 arrow damage' },
      { cost: { food: 20, gold: 10 }, description: '+1 arrow damage', requiresTownhall2: true },
      { cost: { food: 30, gold: 20 }, description: '+1 arrow damage' },
    ],
  },
  {
    id: 'big_actor',
    name: 'Big Actor',
    levels: [
      { cost: { food: 15, gold: 15 }, description: '+5 actions' },
      { cost: { food: 25, gold: 25 }, description: '+5 actions', requiresTownhall2: true },
    ],
  },
];

const getTechBuildingPrereq = (techId: string) => {
  if (techId === 'big_actor') {
    return { building: 'university', name: 'University' as const };
  }
  return { building: 'blacksmith', name: 'Blacksmith' as const };
};

const diceOptions = Array.from({ length: 24 }, (_, index) => (index + 1) * 6);

function App() {
  const [currentTab, setCurrentTab] = useState(1);
  const [actions, setActions] = useState(5);
  const [resources, setResources] = useState(initialResources);
  const [gatherDiceResult, setGatherDiceResult] = useState<number | null>(null);
  const [diceTabResult, setDiceTabResult] = useState<number | null>(null);
  const [buildingCounts, setBuildingCounts] = useState<Record<string, number>>({ townhall: 1 });
  const [unitCounts, setUnitCounts] = useState<Record<string, number>>({ villager: 1 });
  const [techLevels, setTechLevels] = useState<Record<string, number>>({});
  const [shieldBonus, setShieldBonus] = useState(0);
  const [swordSharpness, setSwordSharpness] = useState(0);
  const [pikeSharpness, setPikeSharpness] = useState(0);
  const [arrowSharpness, setArrowSharpness] = useState(0);
  const [firingDepth, setFiringDepth] = useState(3);
  const [actionBonuses, setActionBonuses] = useState(0);
  const [satiatedSouls, setSatiatedSouls] = useState(0);
  const [relocationBlessings, setRelocationBlessings] = useState(0);
  const [resurrectionBlessings, setResurrectionBlessings] = useState(0);
  const [resourceDepleted, setResourceDepleted] = useState(false);
  const [activeRange, setActiveRange] = useState<{ unitId: string; type: 'attack' | 'move'; imageName: string } | null>(null);

  const hasChurch = (buildingCounts.church || 0) > 0;

  const populationUsed = useMemo(() => {
    return units.reduce((sum, unit) => sum + (unitCounts[unit.id] || 0) * unit.popCost, 0);
  }, [unitCounts]);

  const maxPopulation = useMemo(() => {
    return buildings.reduce((sum, building) => {
      const baseCount = buildingCounts[building.id] || 0;
      const upgradeCount = building.upgrade ? buildingCounts[building.upgrade.id] || 0 : 0;
      return sum + baseCount * (building.popBonus || 0) + upgradeCount * (building.upgrade?.popBonus || 0);
    }, basePopulationLimit);
  }, [buildingCounts]);

  const getRangeImageName = (unitId: string, type: 'attack' | 'move') => {
    const unitImageKey = {
      villager: 'villager',
      swordman: 'swordsman',
      pikeman: 'pikeman',
      archer: 'archer',
      horseman: 'horseman',
      elephant_archer: 'elephant_archer',
      siege_ram: 'siege_ram',
      trebuchet: 'trebuchet',
    }[unitId] ?? unitId;

    return `${type === 'attack' ? 'AR' : 'MR'}${unitImageKey}`;
  };

  const townhall2Count = useMemo(() => {
    return buildingCounts['townhall2'] || 0;
  }, [buildingCounts]);

  const totalActions = useMemo(() => {
    const bigActorLevel = techLevels['big_actor'] || 0;
    const bonus = (townhall2Count > 0 ? 5 : 0) + (bigActorLevel * 5);
    return 5 + bonus;
  }, [townhall2Count, techLevels]);

  type Tech = {
    id: string;
    name: string;
    levels: {
      cost: Partial<Record<ResourceKey, number>>;
      description: string;
      requiresTownhall2?: boolean;
    }[];
  };
  const feastTotal = useMemo(() => {
    return units.reduce((sum, unit) => sum + (unitCounts[unit.id] || 0) * unit.feast, 0);
  }, [unitCounts]);

  const canAfford = (cost: Partial<Record<ResourceKey, number>>) => {
    return Object.entries(cost).every(([key, value]) => resources[key as ResourceKey] >= (value || 0));
  };

  const spendResources = (cost: Partial<Record<ResourceKey, number>>) => {
    setResources((current) => {
      const next = { ...current };
      Object.entries(cost).forEach(([key, value]) => {
        if (!value) return;
        next[key as ResourceKey] = Math.max(0, next[key as ResourceKey] - value);
      });
      return next;
    });
  };

  const updateResource = (key: ResourceKey, delta: number) => {
    setResources((current) => {
      const nextVal = current[key] + delta;
      if (key === 'food') {
        return { ...current, [key]: nextVal };
      }
      return { ...current, [key]: Math.max(0, nextVal) };
    });
  };

  const gatherResource = (key: ResourceKey) => {
    const value = Math.floor(Math.random() * 6) + 1;
    if (value === 6) {
      setResourceDepleted(true);
      setTimeout(() => setResourceDepleted(false), 2000);
    }
    updateResource(key, 1);
    setGatherDiceResult(value);
  };

  const fishAction = (mode: 'fish' | 'rain') => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setGatherDiceResult(roll);
    if (mode === 'fish') {
      if (roll === 1) updateResource('food', 1);
    } else {
      if (roll !== 1) updateResource('food', 1);
    }
  };

  const build = (building: Building) => {
    if (building.requiresTownhall2 && townhall2Count === 0) return;
    if (!canAfford(building.cost)) return;
    spendResources(building.cost);
    setBuildingCounts((current) => ({ ...current, [building.id]: (current[building.id] || 0) + 1 }));
  };

  const demolish = (building: Building) => {
    setBuildingCounts((current) => {
      const next = { ...current };
      if (building.upgrade && (next[building.upgrade.id] || 0) > 0) {
        next[building.upgrade.id] = Math.max(0, (next[building.upgrade.id] || 0) - 1);
        if (next[building.upgrade.id] === 0) delete next[building.upgrade.id];
        return next;
      }
      const currentCount = next[building.id] || 0;
      if (currentCount <= 1) {
        delete next[building.id];
        return next;
      }
      next[building.id] = currentCount - 1;
      return next;
    });
  };

  const upgradeBuilding = (building: Building) => {
    if (!building.upgrade) return;
    const count = buildingCounts[building.id] || 0;
    if (count <= 0) return;
    if (!canAfford(building.upgrade.cost)) return;

    spendResources(building.upgrade.cost);
    setBuildingCounts((current) => {
      const next = { ...current };
      next[building.id] = Math.max(0, (next[building.id] || 0) - 1);
      if (next[building.id] === 0) delete next[building.id];
      next[building.upgrade!.id] = (next[building.upgrade!.id] || 0) + 1;
      return next;
    });
  };

  const demolishUpgrade = (building: Building) => {
    if (!building.upgrade) return;
    setBuildingCounts((current) => {
      const next = { ...current };
      if ((next[building.upgrade!.id] || 0) <= 1) {
        delete next[building.upgrade!.id];
      } else {
        next[building.upgrade!.id] = (next[building.upgrade!.id] || 0) - 1;
      }
      return next;
    });
  };

  const trainUnit = (unit: Unit) => {
    if (!canAfford(unit.cost)) return;
    if (unit.id !== 'villager' && unit.id !== 'siege_ram' && unit.id !== 'trebuchet' && (unitCounts.villager || 0) <= 0) return;
    if (populationUsed + unit.popCost > maxPopulation) return;
    spendResources(unit.cost);
    setUnitCounts((current) => {
      const next = { ...current, [unit.id]: (current[unit.id] || 0) + 1 };
      if (unit.id !== 'villager' && unit.id !== 'siege_ram' && unit.id !== 'trebuchet') {
        next.villager = Math.max(0, (current.villager || 0) - 1);
      }
      return next;
    });
  };

  const killUnit = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    setUnitCounts((current) => {
      const count = current[unitId] || 0;
      return { ...current, [unitId]: Math.max(0, count - 1) };
    });
    if (!unit || !hasChurch) return;
    if (unit.id === 'horseman' || unit.id === 'elephant_archer') {
      setSatiatedSouls(s => s + 2);
    } else if (unit.id === 'siege_ram' || unit.id === 'trebuchet') {
      return;
    } else {
      setSatiatedSouls(s => s + 1);
    }
  };

  const purchaseTech = (techId: string, level: number) => {
    const tech = techs.find(t => t.id === techId);
    if (!tech) return;
    const techLevel = techLevels[techId] || 0;
    if (level > techLevel + 1) return;
    if (level < 1 || level > tech.levels.length) return;
    // level 3 is not available yet
    if (level > 2) return;

    const levelObj = tech.levels[level - 1];
    if (levelObj.requiresTownhall2 && townhall2Count === 0) return;

    const { building } = getTechBuildingPrereq(techId);
    if ((buildingCounts[building] || 0) === 0) return;

    const cost = levelObj.cost;
    if (!canAfford(cost)) return;

    spendResources(cost);
    setTechLevels((current) => ({ ...current, [techId]: level }));

    if (techId === 'sword_sharpness') {
      setSwordSharpness(level);
    } else if (techId === 'pike_sharpness') {
      setPikeSharpness(level);
    } else if (techId === 'shield') {
      setShieldBonus(level);
    } else if (techId === 'arrow_sharpness') {
      setArrowSharpness(level);
    } else if (techId === 'bow_quality') {
      setFiringDepth(3 - level);
    }
  };

  const rollDiceTab = (max: number) => {
    const value = Math.floor(Math.random() * max) + 1;
    setDiceTabResult(value);
  };

  const redeemForResource = (res: ResourceKey) => {
    if (satiatedSouls < 1) return;
    setSatiatedSouls(s => s - 1);
    updateResource(res, 1);
  };

  const redeemBlessing = (type: 'relocation' | 'resurrection') => {
    if (type === 'relocation') {
      if (satiatedSouls < 5) return;
      setSatiatedSouls(s => s - 5);
      setRelocationBlessings(b => b + 1);
    } else {
      if (satiatedSouls < 10) return;
      setSatiatedSouls(s => s - 10);
      setResurrectionBlessings(b => b + 1);
    }
  };

  const useBlessing = (type: 'relocation' | 'resurrection') => {
    if (type === 'relocation') {
      setRelocationBlessings(b => Math.max(0, b - 1));
    } else {
      setResurrectionBlessings(b => Math.max(0, b - 1));
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
      <header style={{ marginBottom: 24 }}>
        <h1>Settlers n Siege</h1>
        <p style={{ color: '#94a3b8' }}>
          Actions: {totalActions} · Population: {populationUsed}/{maxPopulation}
        </p>
      </header>

      <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            style={{
              padding: '10px 16px',
              background: currentTab === tab ? '#2563eb' : '#1e293b',
              color: currentTab === tab ? '#fff' : '#cbd5e1',
              borderRadius: 8,
            }}
          >
            {['Resources', 'Dices', 'Builds', 'Units', 'Tech', 'Blessings', 'Other'][tab - 1]}
          </button>
        ))}
      </nav>

      <section style={{ background: '#0f172a', borderRadius: 16, padding: 20, boxShadow: '0 0 0 1px #1e293b' }}>
        {resourceDepleted && (
          <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, color: '#f87171', fontWeight: 'bold', background: 'rgba(15, 23, 42, 0.95)', padding: '16px 24px', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            Resource deplenished
          </div>
        )}
        {currentTab === 1 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
              {Object.entries(resources).map(([key, amount]) => (
                <div key={key} style={{ background: '#111827', borderRadius: 16, padding: 16 }}>
                  <h2 style={{ margin: 0, textTransform: 'capitalize' }}>{key}</h2>
                  <p style={{ margin: '8px 0 16px', fontSize: 24 }}>{amount}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => gatherResource(key as ResourceKey)} style={buttonStyle} disabled={resourceDepleted}>Gather</button>
                    <button onClick={() => updateResource(key as ResourceKey, 10)} style={buttonStyle}>+10</button>
                    <button onClick={() => updateResource(key as ResourceKey, 1)} style={buttonStyle}>+1</button>
                    <button onClick={() => updateResource(key as ResourceKey, -1)} style={buttonStyle}>-1</button>
                    <button onClick={() => updateResource(key as ResourceKey, -10)} style={buttonStyle}>-10</button>
                    {key === 'food' ? (
                      <>
                        <button onClick={() => fishAction('fish')} style={buttonStyle} disabled={resourceDepleted}>Fish</button>
                        <button onClick={() => fishAction('rain')} style={buttonStyle} disabled={resourceDepleted}>Rain Fish</button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={panelStyle}>
                <h3>Settlement feast</h3>
                <p>{feastTotal}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => updateResource('food', -feastTotal)} style={buttonStyle} disabled={feastTotal <= 0}>Feast</button>
                  <p style={{ color: '#94a3b8', margin: 'auto 0' }}>Total feast from all units.</p>
                </div>
              </div>
              <div style={panelStyle}>
                <h3>Dice result</h3>
                <p>{gatherDiceResult ?? 'No action yet'}</p>
                <p style={{ color: '#94a3b8' }}>Gathering any resource produces a random 1-6 roll.</p>
              </div>
            </div>
          </>
        )}

        {currentTab === 6 && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Blessings</h3>
              <div style={{ color: '#94a3b8' }}>Satiated souls: {satiatedSouls}</div>
            </div>

            <div style={panelStyle}>
              {!hasChurch && <p style={{ color: '#f87171', margin: '0 0 12px 0', fontSize: 12 }}>Requires: 1 Church</p>}
              <h4 style={{ marginTop: 0 }}>Redeem for resources (1 soul)</h4>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <button onClick={() => redeemForResource('food')} style={hasChurch && satiatedSouls >= 1 ? buttonStyle : disabledButtonStyle} disabled={!hasChurch || satiatedSouls < 1}>Redeem 1 → Food</button>
                <button onClick={() => redeemForResource('wood')} style={hasChurch && satiatedSouls >= 1 ? buttonStyle : disabledButtonStyle} disabled={!hasChurch || satiatedSouls < 1}>Redeem 1 → Wood</button>
                <button onClick={() => redeemForResource('stone')} style={hasChurch && satiatedSouls >= 1 ? buttonStyle : disabledButtonStyle} disabled={!hasChurch || satiatedSouls < 1}>Redeem 1 → Stone</button>
                <button onClick={() => redeemForResource('gold')} style={hasChurch && satiatedSouls >= 1 ? buttonStyle : disabledButtonStyle} disabled={!hasChurch || satiatedSouls < 1}>Redeem 1 → Gold</button>
              </div>

              <h4>Purchase Blessings</h4>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <p style={{ margin: '4px 0' }}>Relocation blessing (cost: 5 souls)</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => redeemBlessing('relocation')} style={hasChurch && satiatedSouls >= 5 ? buttonStyle : disabledButtonStyle} disabled={!hasChurch || satiatedSouls < 5}>Redeem</button>
                    <p style={{ margin: 'auto 0' }}>Owned: {relocationBlessings}</p>
                    <button onClick={() => useBlessing('relocation')} style={hasChurch && relocationBlessings > 0 ? buttonStyle : disabledButtonStyle} disabled={!hasChurch || relocationBlessings <= 0}>Use</button>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <p style={{ margin: '4px 0' }}>Resurrection blessing (cost: 10 souls)</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => redeemBlessing('resurrection')} style={hasChurch && satiatedSouls >= 10 ? buttonStyle : disabledButtonStyle} disabled={!hasChurch || satiatedSouls < 10}>Redeem</button>
                    <p style={{ margin: 'auto 0' }}>Owned: {resurrectionBlessings}</p>
                    <button onClick={() => useBlessing('resurrection')} style={hasChurch && resurrectionBlessings > 0 ? buttonStyle : disabledButtonStyle} disabled={!hasChurch || resurrectionBlessings <= 0}>Use</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 7 && (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1.2fr 1fr' }}>
            <div style={panelStyle}>
              <h3 style={{ margin: 0 }}>Mobs</h3>
              <div style={{ marginTop: 12 }}>
                <h4>Ogre</h4>
                <p style={{ margin: '4px 0' }}>Description: The Ogre. Might or might not be in your local forest. His immense club and sheer ferocity makes him 1-hit everything in his path. When found he uses his 2 actions to move the shortest path towards the closest building or unit. Whenever he walks on a resource, it is destroyed. He uses 1 action when attacking.</p>
                <p style={{ margin: '4px 0' }}>Health: 1-114</p>
                <p style={{ margin: '4px 0' }}>Damage: ∞</p>
                <p style={{ margin: '4px 0' }}>Actions per round: 2</p>
              </div>
            </div>
            <div style={panelStyle}>
              <h3 style={{ margin: 0 }}>Events</h3>
              <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>Meteorite</h4>
                  <p style={{ margin: 0, color: '#cbd5e1' }}>A die is rolled and the meteor lands on the tile with the corresponding value of the value the die that got rolled got. If a meteor lands on resources, buildings or people, they are destroyed. When a meteor is harvested, the player gets 3 free upgrades that he must enact at once.</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>Wind</h4>
                  <p style={{ margin: 0, color: '#cbd5e1' }}>Increases movement speed by +1 for units moving with the wind and decreases it by 1 for units moving against the wind. The wind can blow from north to south, west to east, south to north, or east to west.</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>Rain</h4>
                  <p style={{ margin: 0, color: '#cbd5e1' }}>Fishing harvest mechanism is reversed: Instead of getting success at dice roll 1 and failure at 2-6, it is the other way around. Food produced from a villager at mills is also doubled.</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>Famine</h4>
                  <p style={{ margin: 0, color: '#cbd5e1' }}>When active, producing food from mills is deactivated.</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>Christmas</h4>
                  <p style={{ margin: 0, color: '#cbd5e1' }}>Attacking is disabled for the current round of turns.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 2 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12, marginBottom: 16 }}>
              {diceOptions.map((max) => (
                <button key={max} onClick={() => rollDiceTab(max)} style={diceButtonStyle}>
                  <div>{`1-${max}`}</div>
                </button>
              ))}
            </div>
            <div style={panelStyle}>
              <h3>Dice result</h3>
              <p>{diceTabResult ?? 'Click a dice to roll'}</p>
            </div>
          </>
        )}

        {currentTab === 3 && (
          <div style={{ display: 'grid', gap: 16 }}>
            {buildings.map((building) => {
              const baseCount = buildingCounts[building.id] || 0;
              const upgradeCount = building.upgrade ? buildingCounts[building.upgrade.id] || 0 : 0;
              const canBuild = canAfford(building.cost) && (!building.requiresTownhall2 || townhall2Count > 0);
              const canUpgrade = building.upgrade && baseCount > 0 && canAfford(building.upgrade.cost);
              return (
                <div key={building.id} style={panelStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{building.name}</h3>
                      <p style={{ margin: '8px 0' }}>Space: {building.space}</p>
                      <p style={{ margin: '8px 0' }}>Health: {building.health}</p>
                      {building.popBonus ? <p style={{ margin: '8px 0' }}>Population limit +{building.popBonus}</p> : null}
                      <p style={{ margin: '8px 0' }}>Count: {baseCount}</p>
                      {building.requiresTownhall2 && townhall2Count === 0 && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Townhall Level 2</p>}
                      {upgradeCount > 0 ? (
                        <>
                          <p style={{ margin: '8px 0' }}>{building.upgrade?.name}: {upgradeCount}</p>
                          <p style={{ margin: '4px 0' }}>Health: {building.upgrade?.health}</p>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                    <button onClick={() => build(building)} style={canBuild ? buttonStyle : disabledButtonStyle} disabled={!canBuild}>Build</button>
                    {baseCount > 0 && <button onClick={() => demolish(building)} style={buttonStyle}>Demolish</button>}
                    {building.upgrade && upgradeCount > 0 && <button onClick={() => demolishUpgrade(building)} style={buttonStyle}>Demolish {building.upgrade.name}</button>}
                    {building.upgrade ? (
                      <button onClick={() => upgradeBuilding(building)} style={canUpgrade ? buttonStyle : disabledButtonStyle} disabled={!canUpgrade}>Upgrade</button>
                    ) : null}
                  </div>
                  <div style={{ marginTop: 10, color: '#94a3b8' }}>
                    <p style={{ margin: '4px 0' }}>Cost: {Object.entries(building.cost).map(([key, value]) => `${value} ${key}`).join(' + ') || 'Free'}</p>
                    {building.upgrade ? (
                      <p style={{ margin: '4px 0' }}>Upgrade cost: {Object.entries(building.upgrade.cost).map(([key, value]) => `${value} ${key}`).join(' + ') || 'Free'}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

          {currentTab === 4 && (
            <div style={{ display: 'grid', gap: 16 }}>
              {units.map((unit) => {
                const count = unitCounts[unit.id] || 0;
                const hasTownhall = (buildingCounts.townhall || 0) > 0 || (buildingCounts.townhall2 || 0) > 0;
                const hasBarracks = (buildingCounts.barracks || 0) > 0;
                const hasArcheryRange = (buildingCounts.archery_range || 0) > 0;
                const hasStable = (buildingCounts.stable || 0) > 0;
                const hasSiegeWorkshop = (buildingCounts.siege_workshop || 0) > 0;
                
                let meetsRequirements = true;
                if (unit.id === 'villager' && !hasTownhall) meetsRequirements = false;
                if (unit.id === 'swordman' && !hasBarracks) meetsRequirements = false;
                if (unit.id === 'pikeman' && !hasBarracks) meetsRequirements = false;
                if (unit.id === 'horseman' && (!hasBarracks || !hasStable)) meetsRequirements = false;
                if (unit.id === 'archer' && !hasArcheryRange) meetsRequirements = false;
                if (unit.id === 'elephant_archer' && (!hasArcheryRange || !hasStable)) meetsRequirements = false;
                if (unit.id === 'siege_ram' && !hasSiegeWorkshop) meetsRequirements = false;
                if (unit.id === 'trebuchet' && !hasSiegeWorkshop) meetsRequirements = false;
                
                const canTrain = canAfford(unit.cost) && (unit.id === 'villager' || unit.id === 'siege_ram' || unit.id === 'trebuchet' || (unitCounts.villager || 0) > 0) && populationUsed + unit.popCost <= maxPopulation && meetsRequirements;
                // compute displayed damage (base + tech bonuses)
                let computedDamage = unit.damage;
                let damageBonusLabel = '';
                if (unit.id === 'swordman' || unit.id === 'horseman') {
                  if (swordSharpness > 0) {
                    computedDamage = unit.damage + swordSharpness;
                    damageBonusLabel = `+${swordSharpness} from sword sharpness`;
                  }
                }
                if (unit.id === 'archer') {
                  if (arrowSharpness > 0) {
                    computedDamage = unit.damage + arrowSharpness;
                    damageBonusLabel = `+${arrowSharpness} from arrow sharpness`;
                  }
                }
                if (unit.id === 'pikeman') {
                  if (pikeSharpness > 0) {
                    computedDamage = unit.damage + pikeSharpness;
                    damageBonusLabel = `+${pikeSharpness} from pike sharpness`;
                  }
                }

                return (
                  <div key={unit.id} style={panelStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                      <div>
                        <h3 style={{ margin: 0 }}>{unit.id === 'swordman' ? 'Swordsman' : unit.name}</h3>
                        <p style={{ margin: '8px 0' }}>Pop cost: {unit.popCost}</p>
                        <p style={{ margin: '8px 0' }}>Feast: {unit.feast}</p>
                        <p style={{ margin: '8px 0' }}>Health: {unit.health}</p>
                        <p style={{ margin: '8px 0' }}>Damage: {computedDamage}</p>
                        {damageBonusLabel && <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: 12 }}>{damageBonusLabel}</p>}
                        {unit.id === 'swordman' && shieldBonus > 0 && <p style={{ margin: '8px 0' }}>Shield: {shieldBonus}</p>}
                        {unit.id === 'archer' && firingDepth < 3 && <p style={{ margin: '8px 0' }}>Firing depth: {firingDepth}</p>}
                        {unit.id === 'archer' && (techLevels['bow_quality'] || 0) >= 2 && <p style={{ margin: '8px 0' }}>+1 range from bow quality level 2</p>}
                        <p style={{ margin: '8px 0' }}>Move cost: {unit.moveCost}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
                          <button onClick={() => setActiveRange((current) => current?.unitId === unit.id && current?.type === 'attack' ? null : { unitId: unit.id, type: 'attack', imageName: getRangeImageName(unit.id, 'attack') })} style={buttonStyle}>Attack range</button>
                          <button onClick={() => setActiveRange((current) => current?.unitId === unit.id && current?.type === 'move' ? null : { unitId: unit.id, type: 'move', imageName: getRangeImageName(unit.id, 'move') })} style={buttonStyle}>Move range</button>
                        </div>
                        {activeRange?.unitId === unit.id && (
                          <div style={{ margin: '8px 0', padding: 12, background: '#0f172a', borderRadius: 12 }}>
                            <p style={{ margin: '0 0 8px', color: '#cbd5e1' }}>{activeRange.type === 'attack' ? 'Attack range' : 'Move range'}</p>
                            <img src={`/${activeRange.imageName}.svg`} alt={`${unit.name} ${activeRange.type} range`} style={{ width: '100%', maxWidth: 240, borderRadius: 8 }} />
                          </div>
                        )}
                        {unit.special ? <p style={{ margin: '8px 0' }}>Special: {unit.special}</p> : null}
                        {unit.id === 'villager' && !hasTownhall && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Townhall</p>}
                        {unit.id === 'swordman' && !hasBarracks && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Barracks</p>}
                        {unit.id === 'pikeman' && !hasBarracks && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Barracks</p>}
                        {unit.id === 'horseman' && !hasBarracks && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Barracks</p>}
                        {unit.id === 'archer' && !hasArcheryRange && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Archery range</p>}
                        {unit.id === 'horseman' && !hasStable && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Stable</p>}
                        {unit.id === 'elephant_archer' && !hasArcheryRange && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Archery range</p>}
                        {unit.id === 'elephant_archer' && !hasStable && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Stable</p>}
                        {unit.id === 'siege_ram' && !hasSiegeWorkshop && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Siege workshop</p>}
                        {unit.id === 'trebuchet' && !hasSiegeWorkshop && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Siege workshop</p>}
                      </div>
                      <div style={{ minWidth: 140, textAlign: 'right' }}>
                        <p style={{ margin: '0 0 8px' }}>Population: {count}</p>
                        <button onClick={() => trainUnit(unit)} style={canTrain ? buttonStyle : disabledButtonStyle} disabled={!canTrain}>
                          {unit.id === 'villager' ? 'Produce' : unit.id === 'siege_ram' || unit.id === 'trebuchet' ? 'Create' : 'Train'}
                        </button>
                        <button onClick={() => killUnit(unit.id)} style={count > 0 ? buttonStyle : disabledButtonStyle} disabled={count <= 0}>{unit.id === 'siege_ram' || unit.id === 'trebuchet' ? 'Wrecked' : 'Died'}</button>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, color: '#94a3b8' }}>
                      <p style={{ margin: '4px 0' }}>Cost: {Object.entries(unit.cost).map(([key, value]) => `${value} ${key}`).join(' + ') || 'Free'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {currentTab === 5 && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={panelStyle}>
              <h3 style={{ margin: 0 }}>Blacksmith</h3>
              <div style={{ marginTop: 12 }}>
                {techs.filter(t => t.id !== 'big_actor').map((tech) => (
                  <div key={tech.id} style={{ marginTop: 12 }}>
                    <h4 style={{ margin: '6px 0' }}>{tech.name}</h4>
                    {tech.levels.map((level, index) => {
                      const levelNum = index + 1;
                      const currentLevel = techLevels[tech.id] || 0;
                      const levelObj = level as any;
                      const requiresTH2 = !!levelObj.requiresTownhall2;
                      const req = getTechBuildingPrereq(tech.id);
                      const hasReqBuilding = (buildingCounts[req.building] || 0) > 0;
                      const canPurchase = canAfford(level.cost) && (levelNum === currentLevel + 1) && levelNum <= 2 && (!requiresTH2 || townhall2Count > 0) && hasReqBuilding;
                      return (
                        <div key={levelNum} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #334155' }}>
                          <p style={{ margin: 0 }}>Level {levelNum}: {level.description}</p>
                          <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: 12 }}>Cost: {Object.entries(level.cost).map(([k, v]) => `${v} ${k}`).join(' + ')}</p>
                          {!hasReqBuilding && (
                            <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>
                              Requires: 1 {req.name}
                            </p>
                          )}
                          {requiresTH2 && townhall2Count === 0 && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Townhall Level 2</p>}
                          {currentLevel >= levelNum ? (
                            <p style={{ margin: '8px 0', color: '#86efac', fontSize: 12 }}>✓ Learned</p>
                          ) : levelNum > 2 ? (
                            <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: 12 }}>Not available yet</p>
                          ) : levelNum === currentLevel + 1 ? (
                            <button onClick={() => purchaseTech(tech.id, levelNum)} style={canPurchase ? buttonStyle : disabledButtonStyle} disabled={!canPurchase}>
                              Learn
                            </button>
                          ) : (
                            <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: 12 }}>Locked</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div style={panelStyle}>
              <h3 style={{ margin: 0 }}>University</h3>
              <div style={{ marginTop: 12 }}>
                {techs.filter(t => t.id === 'big_actor').map((tech) => (
                  <div key={tech.id} style={{ marginTop: 12 }}>
                    <h4 style={{ margin: '6px 0' }}>{tech.name}</h4>
                    {tech.levels.map((level, index) => {
                      const levelNum = index + 1;
                      const currentLevel = techLevels[tech.id] || 0;
                      const levelObj = level as any;
                      const requiresTH2 = !!levelObj.requiresTownhall2;
                      const req = getTechBuildingPrereq(tech.id);
                      const hasReqBuilding = (buildingCounts[req.building] || 0) > 0;
                      const canPurchase = canAfford(level.cost) && (levelNum === currentLevel + 1) && levelNum <= 2 && (!requiresTH2 || townhall2Count > 0) && hasReqBuilding;
                      return (
                        <div key={levelNum} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #334155' }}>
                          <p style={{ margin: 0 }}>Level {levelNum}: {level.description}</p>
                          <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: 12 }}>Cost: {Object.entries(level.cost).map(([k, v]) => `${v} ${k}`).join(' + ')}</p>
                          {!hasReqBuilding && (
                            <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>
                              Requires: 1 {req.name}
                            </p>
                          )}
                          {requiresTH2 && townhall2Count === 0 && <p style={{ color: '#f87171', margin: '4px 0', fontSize: 12 }}>Requires: 1 Townhall Level 2</p>}
                          {currentLevel >= levelNum ? (
                            <p style={{ margin: '8px 0', color: '#86efac', fontSize: 12 }}>✓ Learned</p>
                          ) : levelNum > 2 ? (
                            <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: 12 }}>Not available yet</p>
                          ) : levelNum === currentLevel + 1 ? (
                            <button onClick={() => purchaseTech(tech.id, levelNum)} style={canPurchase ? buttonStyle : disabledButtonStyle} disabled={!canPurchase}>
                              Learn
                            </button>
                          ) : (
                            <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: 12 }}>Locked</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  background: '#2563eb',
  color: '#fff',
  padding: '10px 12px',
  borderRadius: 10,
  minWidth: 96,
  cursor: 'pointer',
};

const disabledButtonStyle: React.CSSProperties = {
  background: '#475569',
  color: '#94a3b8',
  padding: '10px 12px',
  borderRadius: 10,
  minWidth: 96,
  cursor: 'not-allowed',
};

const panelStyle: React.CSSProperties = {
  background: '#111827',
  borderRadius: 16,
  padding: 18,
};

const diceButtonStyle: React.CSSProperties = {
  background: '#1e293b',
  borderRadius: 16,
  padding: 18,
  color: '#e2e8f0',
  minHeight: 90,
};

export default App;
