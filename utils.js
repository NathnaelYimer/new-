function loadSettings() {
    try {
      const savedSettings = localStorage.getItem('menuSettings');
      return savedSettings ? JSON.parse(savedSettings) : {
        version: "1.0",
        columnNames: {
          platinum: "Platinum",
          gold: "Gold",
          silver: "Silver",
          bronze: "Bronze",
          iron: "Iron"
        },
        columnVisibility: {
          platinum: true,
          gold: true,
          silver: true,
          bronze: true,
          iron: false
        },
        columnColors: {
          platinum: "platinum-bg",
          gold: "gold-bg",
          silver: "silver-bg",
          bronze: "bronze-bg",
          iron: "iron-bg"
        },
        showPlatinumFirst: false,
        columnOrder: ["gold", "silver", "bronze", "iron", "platinum"],
        productData: {},
        productAssignments: {
          platinum: [],
          gold: [],
          silver: [],
          bronze: [],
          iron: []
        }
      };
    } catch (e) {
      console.error('Error loading settings:', e);
      return {
        version: "1.0",
        columnNames: {
          platinum: "Platinum",
          gold: "Gold",
          silver: "Silver",
          bronze: "Bronze",
          iron: "Iron"
        },
        columnVisibility: {
          platinum: true,
          gold: true,
          silver: true,
          bronze: true,
          iron: false
        },
        columnColors: {
          platinum: "platinum-bg",
          gold: "gold-bg",
          silver: "silver-bg",
          bronze: "bronze-bg",
          iron: "iron-bg"
        },
        showPlatinumFirst: false,
        columnOrder: ["gold", "silver", "bronze", "iron", "platinum"],
        productData: {},
        productAssignments: {
          platinum: [],
          gold: [],
          silver: [],
          bronze: [],
          iron: []
        }
      };
    }
  }
  
  function saveSettings(settings) {
    try {
      localStorage.setItem('menuSettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }
  
  function getSortedColumns(settings) {
    const columns = [
      { id: 'iron', name: settings.columnNames.iron, visible: settings.columnVisibility.iron, color: settings.columnColors.iron },
      { id: 'bronze', name: settings.columnNames.bronze, visible: settings.columnVisibility.bronze, color: settings.columnColors.bronze },
      { id: 'silver', name: settings.columnNames.silver, visible: settings.columnVisibility.silver, color: settings.columnColors.silver },
      { id: 'gold', name: settings.columnNames.gold, visible: settings.columnVisibility.gold, color: settings.columnColors.gold },
      { id: 'platinum', name: settings.columnNames.platinum, visible: settings.columnVisibility.platinum, color: settings.columnColors.platinum }
    ];
    return settings.showPlatinumFirst
      ? columns.sort((a, b) => a.id === 'platinum' ? -1 : b.id === 'platinum' ? 1 : 0)
      : columns.sort((a, b) => a.id === 'platinum' ? 1 : b.id === 'platinum' ? -1 : 0);
  }