// Helper functions for traversing Notion Client List structure
// Structure: Client List → Boat Page → Service Log (child_page) → synced_block → Conditions (child_database)

const NOTION_DB_ID = '0ae0e330-780b-4764-956e-12e8ee344ea2';

export async function getConditionsDatabase(boatPageId: string, token: string): Promise<string | null> {
  try {
    // 1. Get children of boat page to find Service Log
    const boatChildren = await fetch(`https://api.notion.com/v1/blocks/${boatPageId}/children`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28'
      }
    }).then(r => r.json());
    
    const serviceLog = boatChildren.results?.find((b: any) => 
      b.type === 'child_page' && b.child_page?.title?.includes('Service Log')
    );
    
    if (!serviceLog) return null;
    
    // 2. Get children of Service Log
    const serviceLogChildren = await fetch(`https://api.notion.com/v1/blocks/${serviceLog.id}/children`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28'
      }
    }).then(r => r.json());
    
    // 3. Check synced_block first (common location)
    for (const block of serviceLogChildren.results || []) {
      if (block.type === 'synced_block') {
        const syncedChildren = await fetch(`https://api.notion.com/v1/blocks/${block.id}/children`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28'
          }
        }).then(r => r.json());
        
        // Look for Conditions database OR any service-related database
        const conditionsDb = syncedChildren.results?.find((b: any) => 
          b.type === 'child_database' && (
            b.child_database?.title?.toLowerCase().includes('conditions') ||
            b.child_database?.title?.toLowerCase().includes('service')
          )
        );
        
        if (conditionsDb) return conditionsDb.id;
      }
      
      // Also check direct child_database
      if (block.type === 'child_database' && (
        block.child_database?.title?.toLowerCase().includes('conditions') ||
        block.child_database?.title?.toLowerCase().includes('service')
      )) {
        return block.id;
      }
    }
    
    return null;
  } catch (err) {
    console.error('Error finding Conditions database:', err);
    return null;
  }
}

export async function getServiceConditions(
  conditionsDbId: string, 
  startDate: string, 
  endDate: string, 
  token: string
): Promise<{ growth: string[], anodes: string[], installed: number | null, notes: string | null, date: string } | null> {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${conditionsDbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Date', date: { on_or_after: startDate }},
            { property: 'Date', date: { before: endDate }}
          ]
        },
        page_size: 1
      })
    });
    
    const data = await response.json();
    const result = data.results?.[0];
    
    if (!result) return null;
    
    return {
      date: result.properties.Date?.date?.start || '',
      growth: result.properties.Growth?.multi_select?.map((g: any) => g.name) || [],
      anodes: result.properties.Anodes?.multi_select?.map((a: any) => a.name) || [],
      installed: result.properties.Installed?.number || null,
      notes: result.properties.Notes?.rich_text?.[0]?.plain_text || null
    };
  } catch (err) {
    console.error('Error querying Conditions:', err);
    return null;
  }
}

// Calculate growth surcharge based on growth levels
export function calculateGrowthSurcharge(growth: string[]): { percent: number, description: string } {
  const levels = growth.map(g => g.toLowerCase());
  const hasMinimal = levels.includes('minimal');
  const hasModerate = levels.includes('moderate');
  const hasHeavy = levels.includes('heavy');
  const hasSevere = levels.includes('severe');
  
  // Graduated surcharges based on range
  if (hasSevere && hasHeavy) return { percent: 0.75, description: 'Heavy→Severe' };
  if (hasSevere) return { percent: 1.0, description: 'Severe' };
  if (hasHeavy && hasModerate) return { percent: 0.375, description: 'Mod→Heavy' };
  if (hasHeavy && hasMinimal) return { percent: 0.25, description: 'Min→Heavy' };
  if (hasHeavy) return { percent: 0.5, description: 'Heavy' };
  if (hasModerate && hasMinimal) return { percent: 0, description: 'Min→Mod' };
  if (hasModerate) return { percent: 0, description: 'Moderate' };
  return { percent: 0, description: 'Minimal' };
}

// Determine anode type and cost from notes
export function parseAnodeFromNotes(notes: string | null, anodes: string[]): { type: string, cost: number } | null {
  if (!anodes.includes('Replaced') || !notes) return null;
  
  const notesLower = notes.toLowerCase();
  
  // Check for specific anode types mentioned in notes
  if (notesLower.includes('1-inch') || notesLower.includes('1"') || notesLower.includes('shaft')) {
    const count = notesLower.includes('two') || notesLower.includes('2') ? 2 : 1;
    return { type: `${count > 1 ? count + 'x ' : ''}1" shaft`, cost: 31.92 * count };
  }
  if (notesLower.includes('beneteau') && notesLower.includes('30')) {
    return { type: 'Beneteau 30mm prop', cost: 28.37 };
  }
  if (notesLower.includes('612') || notesLower.includes('hull')) {
    return { type: '612H hull', cost: 143.04 };
  }
  if (notesLower.includes('variprop') || notesLower.includes('df-80')) {
    return { type: 'DF-80 Variprop', cost: 46.46 };
  }
  
  // Default to 1" shaft if "replaced" but type unclear
  return { type: '1" shaft', cost: 31.92 };
}
