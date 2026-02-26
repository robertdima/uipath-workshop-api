/**
 * ITSM Console - Toast Notifications Module
 */

const Toast = {
    show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };

        const iconSpan = document.createElement('span');
        iconSpan.style.marginRight = '8px';
        iconSpan.textContent = icons[type] || icons.info;

        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '\u00d7';
        closeBtn.style.cssText = 'margin-left: auto; background: none; border: none; cursor: pointer; opacity: 0.7;';
        closeBtn.onclick = function() { this.parentElement.remove(); };

        toast.appendChild(iconSpan);
        toast.appendChild(messageSpan);
        toast.appendChild(closeBtn);

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    warning(message, duration) {
        this.show(message, 'warning', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

window.Toast = Toast;

// Backwards compatibility
window.showToast = Toast.show.bind(Toast);
