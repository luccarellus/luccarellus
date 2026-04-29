/**
 * N.E.V.A Pro - Settings Management
 */
import { getSession, fetchUserProfile } from './auth.js';
import { api } from './api.js';

export const SETTINGS_STORAGE_KEY = 'nevapro_settings_v1';

export function getDefaultSettings() {
    return {
        displayName: 'Estudante',
        email: '',
        dailyGoalHours: '4',
        preferredLanguage: 'espanhol',
        notificationsEmail: true,
        notificationsPush: true,
        theme: 'system', // system | light | dark
        reduceMotion: false,
        profileVisibility: 'public', // public | private
    };
}

export async function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        const session = getSession();
        let settings = getDefaultSettings();
        
        if (raw) {
            settings = { ...settings, ...JSON.parse(raw) };
        }
        
        if (session?.user) {
            settings.displayName = session.user.name || settings.displayName;
            settings.email = session.user.email || settings.email;
        }
        
        return settings;
    } catch (e) {
        return getDefaultSettings();
    }
}

export async function saveSettings(settings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    
    const session = getSession();
    if (session?.access_token) {
        try {
            await api.patch('users/me', {
                name: settings.displayName
            });
            await fetchUserProfile();
        } catch (error) {
            console.error('Failed to update profile on server:', error);
        }
    }
}
