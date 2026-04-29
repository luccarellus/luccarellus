/**
 * N.E.V.A Pro - General Utilities
 */

export function showToast(message, type = 'info') {
    let toast = document.getElementById('neva-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'neva-toast';
        toast.className = 'neva-toast';
        document.body.appendChild(toast);
    }

    const icons = {
        success: 'check-circle',
        error: 'alert-circle',
        warning: 'alert-triangle',
        info: 'info'
    };

    const iconName = icons[type] || icons.info;
    
    // Update content
    toast.innerHTML = `
        <i data-lucide="${iconName}" style="width: 20px; height: 20px;"></i>
        <span>${message}</span>
    `;

    // Reset classes
    toast.className = 'neva-toast';
    toast.classList.add(type);

    // Initial lucide icons for the new content
    if (window.lucide) {
        window.lucide.createIcons({
            attrs: { 'stroke-width': 2.5 },
            nameAttr: 'data-lucide',
            root: toast
        });
    }

    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto hide
    clearTimeout(window.__nevaToastTimer);
    window.__nevaToastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

export function getApiBaseUrl() {
    return window.APP_CONFIG?.API_BASE_URL || 'http://localhost:3333/api/v1';
}

export function sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
