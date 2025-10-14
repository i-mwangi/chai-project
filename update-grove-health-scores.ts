/**
 * Update Health Scores for All Groves
 * This script sets default health scores for groves that don't have them
 */

import { db } from './db'
import { coffeeGroves } from './db/schema'
import { eq, isNull } from 'drizzle-orm'

async function updateHealthScores() {
    try {
        console.log('🔍 Checking groves without health scores...\n');
        
        // Get all groves
        const allGroves = await db.select().from(coffeeGroves);
        console.log(`Total groves: ${allGroves.length}`);
        
        // Find groves without health scores
        const grovesWithoutHealth = allGroves.filter(g => !g.currentHealthScore || g.currentHealthScore === 0);
        console.log(`Groves without health scores: ${grovesWithoutHealth.length}\n`);
        
        if (grovesWithoutHealth.length === 0) {
            console.log('✅ All groves already have health scores!');
            return;
        }
        
        // Update each grove with a realistic health score
        for (const grove of grovesWithoutHealth) {
            // Generate a realistic health score between 60-95
            const healthScore = 60 + Math.floor(Math.random() * 36);
            
            await db.update(coffeeGroves)
                .set({ 
                    currentHealthScore: healthScore,
                    updatedAt: Math.floor(Date.now() / 1000)
                })
                .where(eq(coffeeGroves.id, grove.id));
            
            console.log(`✅ Updated "${grove.groveName}" - Health Score: ${healthScore}`);
        }
        
        console.log(`\n✅ Successfully updated ${grovesWithoutHealth.length} groves!`);
        
        // Show summary
        const updatedGroves = await db.select().from(coffeeGroves);
        console.log('\n=== Final Summary ===');
        updatedGroves.forEach(g => {
            const status = g.currentHealthScore >= 80 ? '🟢' : g.currentHealthScore >= 60 ? '🟡' : '🔴';
            console.log(`${status} ${g.groveName}: ${g.currentHealthScore}`);
        });
        
    } catch (error) {
        console.error('❌ Error updating health scores:', error);
    }
}

updateHealthScores();
