/**
 * N.E.V.A Pro - Dashboard Page Logic
 * Modularized entry point
 */
import { getSession } from '../core/auth.js';
import { updateWelcomeMessage, updateStatsGrid, updateEnemCountdown } from './dashboard/stats.js';
import { initWeeklyProgress } from './dashboard/weekly.js';

/**
 * Initializes the dashboard page components and data
 */
export function initDashboard() {
    const session = getSession();
    
    // 1. Update Personal Info & Stats
    updateWelcomeMessage(session);
    updateStatsGrid(session);
    
    // 2. Update Countdown
    updateEnemCountdown();

    // 3. Initialize Weekly Progress & Charts
    initWeeklyProgress();
}
