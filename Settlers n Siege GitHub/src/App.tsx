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
      health: '1-126',
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
      health: '1-42',
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
    cost: {},
    feast: 4,
    health: '1-36',
    damage: 3,
    moveCost: 2,
    special: 'Moving 5 tiles costs 2 actions',
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
    updateResource(key, 1);
    setGatherDiceResult(value);
  };

  const build = (building: Building) => {
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
    if (unit.id !== 'villager' && (unitCounts.villager || 0) <= 0) return;
    if (populationUsed + unit.popCost > maxPopulation) return;
    spendResources(unit.cost);
    setUnitCounts((current) => {
      const next = { ...current, [unit.id]: (current[unit.id] || 0) + 1 };
      if (unit.id !== 'villager') {
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
    if (resources.food < 0 && unit) {
      updateResource('food', unit.feast);
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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
      <header style={{ marginBottom: 24 }}>
        <h1>Settlers n Siege</h1>
        <p style={{ color: '#94a3b8' }}>
          Actions: {totalActions} · Population: {populationUsed}/{maxPopulation}
        </p>
      </header>

      <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {[1, 2, 3, 4, 5].map((tab) => (
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
            {['Resources', 'Dices', 'Builds', 'Units', 'Tech'][tab - 1]}
          </button>
        ))}
      </nav>

      <section style={{ background: '#0f172a', borderRadius: 16, padding: 20, boxShadow: '0 0 0 1px #1e293b' }}>
        {currentTab === 1 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
              {Object.entries(resources).map(([key, amount]) => (
                <div key={key} style={{ background: '#111827', borderRadius: 16, padding: 16 }}>
                  <h2 style={{ margin: 0, textTransform: 'capitalize' }}>{key}</h2>
                  <p style={{ margin: '8px 0 16px', fontSize: 24 }}>{amount}</p>
                  <button onClick={() => gatherResource(key as ResourceKey)} style={buttonStyle}>Gather</button>
                  <button onClick={() => updateResource(key as ResourceKey, 1)} style={buttonStyle}>+1</button>
                  <button onClick={() => updateResource(key as ResourceKey, -1)} style={buttonStyle}>-1</button>
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
              const canBuild = canAfford(building.cost);
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
                      {upgradeCount > 0 ? <p style={{ margin: '8px 0' }}>{building.upgrade?.name}: {upgradeCount}</p> : null}
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
              const canTrain = canAfford(unit.cost) && (unit.id === 'villager' || (unitCounts.villager || 0) > 0) && populationUsed + unit.popCost <= maxPopulation;
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
                      <h3 style={{ margin: 0 }}>{unit.name}</h3>
                      <p style={{ margin: '8px 0' }}>Pop cost: {unit.popCost}</p>
                      <p style={{ margin: '8px 0' }}>Feast: {unit.feast}</p>
                      <p style={{ margin: '8px 0' }}>Health: {unit.health}</p>
                      <p style={{ margin: '8px 0' }}>Damage: {computedDamage}</p>
                      {damageBonusLabel && <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: 12 }}>{damageBonusLabel}</p>}
                      {unit.id === 'swordman' && shieldBonus > 0 && <p style={{ margin: '8px 0' }}>Shield: {shieldBonus}</p>}
                      {unit.id === 'archer' && firingDepth < 3 && <p style={{ margin: '8px 0' }}>Firing depth: {firingDepth}</p>}
                      {unit.id === 'archer' && (techLevels['bow_quality'] || 0) >= 2 && <p style={{ margin: '8px 0' }}>+1 range from bow quality level 2</p>}
                      <p style={{ margin: '8px 0' }}>Move cost: {unit.moveCost}</p>
                      {unit.special ? <p style={{ margin: '8px 0' }}>Special: {unit.special}</p> : null}
                    </div>
                    <div style={{ minWidth: 140, textAlign: 'right' }}>
                      <p style={{ margin: '0 0 8px' }}>Population: {unitCounts[unit.id] || 0}</p>
                      <button onClick={() => trainUnit(unit)} style={canTrain ? buttonStyle : disabledButtonStyle} disabled={!canTrain}>
                        {unit.id === 'villager' ? 'Produce' : unit.id === 'siege_ram' || unit.id === 'trebuchet' ? 'Create' : 'Train'}
                      </button>
                      <button onClick={() => killUnit(unit.id)} style={buttonStyle}>{unit.id === 'siege_ram' || unit.id === 'trebuchet' ? 'Wrecked' : 'Died'}</button>
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
