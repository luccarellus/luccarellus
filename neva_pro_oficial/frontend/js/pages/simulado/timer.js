/**
 * N.E.V.A Pro - Simulado Timer Logic
 */
import { state, updateState } from './state.js';

let timerInterval = null;

export function startTimer(onTick, onFinish) {
    stopTimer();
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        if (state.totalSeconds > 0) {
            updateState({ totalSeconds: state.totalSeconds - 1 });
            updateTimerDisplay();
            if (onTick) onTick(state.totalSeconds);
        } else {
            stopTimer();
            if (onFinish) onFinish();
        }
    }, 1000);
}

export function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

export function updateTimerDisplay() {
    const display = document.getElementById('time-display');
    if (!display) return;

    const h = Math.floor(state.totalSeconds / 3600);
    const m = Math.floor((state.totalSeconds % 3600) / 60);
    const s = state.totalSeconds % 60;
    display.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function getTimeSpent() {
    return (state.initialSeconds || 0) - state.totalSeconds;
}
