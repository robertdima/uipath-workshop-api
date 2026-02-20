/**
 * ITSM Console - Modal Management Module
 */

const Modals = {
    // Show modal with content
    show(content) {
        document.getElementById('modal-container').innerHTML = content;
        document.getElementById('modal-overlay').classList.add('active');
    },

    // Close modal
    close() {
        document.getElementById('modal-overlay').classList.remove('active');
        // Revert hash to module-only for modal-based modules (not split-pane ones like incidents/requests)
        if (typeof currentModule !== 'undefined' && typeof updateHash === 'function' && typeof parseHash === 'function') {
            const splitPaneModules = ['incidents', 'requests'];
            const { itemId } = parseHash();
            if (itemId && !splitPaneModules.includes(currentModule)) {
                updateHash(currentModule, null);
            }
        }
    },

    // Confirmation modal
    confirm(title, message, onConfirm, confirmText = 'Confirm', confirmClass = 'btn-primary') {
        this.show(`
            <div class="modal-header">
                <span>${title}</span>
                <button class="panel-close" onclick="Modals.close()">×</button>
            </div>
            <div class="modal-body" style="min-width: 400px;">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
                <button class="btn ${confirmClass}" onclick="(${onConfirm.toString()})(); Modals.close();">${confirmText}</button>
            </div>
        `);
    },

    // Alert modal
    alert(title, message, type = 'info') {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        this.show(`
            <div class="modal-header">
                <span>${icons[type]} ${title}</span>
                <button class="panel-close" onclick="Modals.close()">×</button>
            </div>
            <div class="modal-body" style="min-width: 350px;">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="Modals.close()">OK</button>
            </div>
        `);
    },

    // Prompt modal with input
    prompt(title, label, placeholder, onSubmit, defaultValue = '') {
        const submitFn = `
            const value = document.getElementById('modal-prompt-input').value;
            if (value) {
                (${onSubmit.toString()})(value);
                Modals.close();
            }
        `;
        this.show(`
            <div class="modal-header">
                <span>${title}</span>
                <button class="panel-close" onclick="Modals.close()">×</button>
            </div>
            <div class="modal-body" style="min-width: 400px;">
                <div class="form-group">
                    <label class="form-label">${label}</label>
                    <input type="text" class="form-control" id="modal-prompt-input"
                           placeholder="${placeholder}" value="${defaultValue}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
                <button class="btn btn-primary" onclick="${submitFn}">Submit</button>
            </div>
        `);
        document.getElementById('modal-prompt-input')?.focus();
    },

    // Textarea prompt modal
    promptTextarea(title, label, placeholder, onSubmit, defaultValue = '', rows = 4) {
        const submitFn = `
            const value = document.getElementById('modal-textarea-input').value;
            if (value) {
                (${onSubmit.toString()})(value);
                Modals.close();
            }
        `;
        this.show(`
            <div class="modal-header">
                <span>${title}</span>
                <button class="panel-close" onclick="Modals.close()">×</button>
            </div>
            <div class="modal-body" style="min-width: 450px;">
                <div class="form-group">
                    <label class="form-label">${label}</label>
                    <textarea class="form-control" id="modal-textarea-input"
                              placeholder="${placeholder}" rows="${rows}">${defaultValue}</textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
                <button class="btn btn-primary" onclick="${submitFn}">Submit</button>
            </div>
        `);
        document.getElementById('modal-textarea-input')?.focus();
    },

    // Form modal (generic)
    form(title, formHtml, onSubmit, submitText = 'Save') {
        this.show(`
            <div class="modal-header">
                <span>${title}</span>
                <button class="panel-close" onclick="Modals.close()">×</button>
            </div>
            <div class="modal-body">
                ${formHtml}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
                <button class="btn btn-primary" onclick="${onSubmit}">${submitText}</button>
            </div>
        `);
    },

    // Loading modal
    loading(message = 'Loading...') {
        this.show(`
            <div class="modal-body" style="text-align: center; padding: 40px;">
                <div class="loading">${message}</div>
            </div>
        `);
    }
};

// Setup modal event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modal-overlay')?.addEventListener('click', function(e) {
        if (e.target === this) Modals.close();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') Modals.close();
    });
});

window.Modals = Modals;
