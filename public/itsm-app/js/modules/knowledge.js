/**
 * ITSM Console - Knowledge Base Module
 * Provides comprehensive knowledge article management functionality
 */

const KnowledgeModule = {
    // Selection state
    selectedIds: new Set(),

    // Available categories for knowledge articles
    categories: ['Network', 'Application', 'Hardware', 'Infrastructure', 'Email', 'Identity', 'Security', 'General'],

    // Available applicability options
    applicabilityOptions: [
        'Windows 10', 'Windows 11', 'Windows Server 2019', 'Windows Server 2022',
        'macOS', 'Linux', 'iOS', 'Android', '.NET Applications', 'Web Applications'
    ],

    /**
     * Search knowledge articles by query and optional category
     * @param {string} query - Search query string
     * @param {string} category - Optional category filter
     * @returns {Array} Filtered array of knowledge articles
     */
    searchKB: function(query, category) {
        if (!query && !category) {
            return ITSMData.knowledgeArticles || [];
        }

        const searchTerm = (query || '').toLowerCase().trim();

        return (ITSMData.knowledgeArticles || []).filter(article => {
            // Category filter
            if (category && article.category !== category) {
                return false;
            }

            // If no search query, just apply category filter
            if (!searchTerm) {
                return true;
            }

            // Search in title (case insensitive)
            const titleMatch = article.title.toLowerCase().includes(searchTerm);

            // Search in content (case insensitive)
            const contentMatch = article.content.toLowerCase().includes(searchTerm);

            // Search in tags (case insensitive)
            const tagsMatch = article.tags.some(tag =>
                tag.toLowerCase().includes(searchTerm)
            );

            // Search in ID
            const idMatch = article.id.toLowerCase().includes(searchTerm);

            return titleMatch || contentMatch || tagsMatch || idMatch;
        });
    },

    /**
     * Filter knowledge articles by category and re-render the KB cards
     * @param {string} category - Category to filter by (empty string for all)
     */
    filterKBByCategory: function(category) {
        const searchInput = document.getElementById('kb-search');
        const query = searchInput ? searchInput.value : '';

        const filtered = this.searchKB(query, category || '');

        const container = document.getElementById('kb-cards-container');
        if (container) {
            container.innerHTML = this.renderKBCards(filtered);
        }
    },

    /**
     * Render HTML for KB article cards grid
     * @param {Array} articles - Array of knowledge articles to render
     * @returns {string} HTML string for the cards grid
     */
    renderKBCards: function(articles) {
        if (!articles || articles.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <div class="empty-state-title">No Articles Found</div>
                    <div class="empty-state-text">Try adjusting your search criteria or browse all articles</div>
                </div>
            `;
        }

        return articles.map(kb => `
            <div class="card kb-card ${this.selectedIds.has(kb.id) ? 'row-selected' : ''}" data-kb-id="${kb.id}">
                <div class="card-header">
                    <input type="checkbox" class="row-check-knowledge" value="${kb.id}" onchange="KnowledgeModule.toggleSelection('${kb.id}')" ${this.selectedIds.has(kb.id) ? 'checked' : ''}>
                    <span class="kb-id">${kb.id}</span>
                    <span class="badge badge-${kb.status === 'Published' ? 'resolved' : 'pending'}">${kb.status}</span>
                </div>
                <div class="card-body">
                    <h4 class="kb-title" style="margin-bottom: var(--spacing-sm);">${Utils.escapeHtml(kb.title)}</h4>
                    <div class="kb-meta" style="font-size: 11px; color: var(--text-muted); margin-bottom: var(--spacing-sm);">
                        <span>📁 ${Utils.escapeHtml(kb.category)}</span> ·
                        <span>👁 ${kb.views} views</span> ·
                        <span>👍 ${kb.helpful}% helpful</span>
                    </div>
                    <div class="kb-tags" style="margin-bottom: var(--spacing-sm);">
                        ${kb.tags.slice(0, 3).map(tag => `<span class="badge badge-new" style="margin-right: 4px;">${Utils.escapeHtml(tag)}</span>`).join('')}
                        ${kb.tags.length > 3 ? `<span style="font-size: 10px; color: var(--text-muted);">+${kb.tags.length - 3} more</span>` : ''}
                    </div>
                    <div class="kb-applicability" style="font-size: 10px; color: var(--text-muted); margin-bottom: var(--spacing-sm);">
                        ${kb.applicability ? Utils.escapeHtml(kb.applicability.slice(0, 2).join(', ')) : 'General'}
                        ${kb.applicability && kb.applicability.length > 2 ? ` +${kb.applicability.length - 2}` : ''}
                    </div>
                    <div class="kb-actions" style="display: flex; gap: var(--spacing-xs);">
                        <button class="btn btn-sm btn-primary" onclick="KnowledgeModule.viewKBArticle('${kb.id}')">View Article</button>
                        <button class="btn btn-sm btn-secondary" onclick="KnowledgeModule.editKBArticle('${kb.id}')">Edit</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Format markdown-style content to HTML
     * @param {string} content - Markdown-style content
     * @returns {string} Formatted HTML
     */
    formatContent: function(content) {
        if (!content) return '';

        let formatted = content
            // Escape HTML first
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Headers
            .replace(/^### (.+)$/gm, '<h4 style="margin: var(--spacing-md) 0 var(--spacing-sm) 0; color: var(--accent-blue);">$1</h4>')
            .replace(/^## (.+)$/gm, '<h3 style="margin: var(--spacing-lg) 0 var(--spacing-sm) 0; color: var(--text-primary); border-bottom: 1px solid var(--border-light); padding-bottom: var(--spacing-xs);">$1</h3>')
            .replace(/^# (.+)$/gm, '<h2 style="margin: var(--spacing-lg) 0 var(--spacing-md) 0; color: var(--text-primary);">$1</h2>')
            // Bold text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code style="background: var(--bg-secondary); padding: 2px 6px; border-radius: 3px; font-family: Consolas, monospace; font-size: 12px;">$1</code>')
            // Code blocks
            .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
                return `<pre style="background: var(--bg-tertiary); padding: var(--spacing-md); border-radius: 4px; overflow-x: auto; font-family: Consolas, monospace; font-size: 12px; margin: var(--spacing-sm) 0;"><code>${code}</code></pre>`;
            })
            // Lists
            .replace(/^(\d+)\. (.+)$/gm, '<div style="margin-left: var(--spacing-md); margin-bottom: var(--spacing-xs);"><span style="color: var(--accent-blue); margin-right: var(--spacing-xs);">$1.</span> $2</div>')
            .replace(/^- (.+)$/gm, '<div style="margin-left: var(--spacing-md); margin-bottom: var(--spacing-xs);"><span style="color: var(--accent-blue); margin-right: var(--spacing-xs);">&#8226;</span> $1</div>')
            // Line breaks
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

        return formatted;
    },

    /**
     * Show modal with full article content
     * @param {string} kbId - Knowledge article ID
     */
    viewKBArticle: function(kbId) {
        const kb = ITSMData.knowledgeArticles.find(k => k.id === kbId);
        if (!kb) {
            if (typeof showToast === 'function') {
                showToast('Article not found', 'error');
            }
            return;
        }
        if (typeof updateHash === 'function') updateHash('knowledge-base', kbId);

        // Increment view count (fire-and-forget API call)
        kb.views = (kb.views || 0) + 1;
        ITSMApi.viewKBArticle(kbId).catch(() => {});

        const formattedContent = this.formatContent(kb.content);

        const modalContent = `
            <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <span class="kb-modal-id" style="font-weight: bold; color: var(--accent-blue);">${kb.id}</span>
                    <span style="margin-left: var(--spacing-sm);">${Utils.escapeHtml(kb.title)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                    <span class="badge badge-${kb.status === 'Published' ? 'resolved' : 'pending'}">${kb.status}</span>
                    <button class="panel-close" onclick="closeModal()">&times;</button>
                </div>
            </div>
            <div class="modal-body" style="max-width: 900px; max-height: 70vh; overflow-y: auto;">
                <!-- Metadata Section -->
                <div class="kb-metadata" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px; margin-bottom: var(--spacing-md);">
                    <div>
                        <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Category</div>
                        <div style="font-weight: 600;">📁 ${Utils.escapeHtml(kb.category)}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Author</div>
                        <div style="font-weight: 600;">👤 ${Utils.escapeHtml(kb.author)}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Created</div>
                        <div style="font-weight: 600;">📅 ${kb.createdAt}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Last Updated</div>
                        <div style="font-weight: 600;">📅 ${kb.updatedAt}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Views</div>
                        <div style="font-weight: 600;">👁 ${kb.views}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Helpful</div>
                        <div style="font-weight: 600;">👍 ${kb.helpful}%</div>
                    </div>
                </div>

                <!-- Applicability Section -->
                ${kb.applicability && kb.applicability.length > 0 ? `
                <div class="kb-applicability-section" style="margin-bottom: var(--spacing-md);">
                    <div style="font-size: 11px; color: var(--text-muted); margin-bottom: var(--spacing-xs);">Applies to:</div>
                    <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-xs);">
                        ${kb.applicability.map(item => `<span class="badge badge-new">${Utils.escapeHtml(item)}</span>`).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Prerequisites Section -->
                ${kb.prerequisites && kb.prerequisites.length > 0 ? `
                <div class="kb-prerequisites" style="margin-bottom: var(--spacing-md); padding: var(--spacing-sm); background: var(--bg-warning); border-left: 3px solid var(--accent-orange); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-xs);">Prerequisites:</div>
                    <ul style="margin: 0; padding-left: var(--spacing-lg);">
                        ${kb.prerequisites.map(prereq => `<li>${Utils.escapeHtml(prereq)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                <!-- Content Section -->
                <div class="kb-content" style="font-family: var(--font-main); line-height: 1.7;">
                    ${formattedContent}
                </div>

                <!-- Tags Section -->
                <div class="kb-tags-section" style="margin-top: var(--spacing-lg); padding-top: var(--spacing-md); border-top: 1px solid var(--border-light);">
                    <div style="font-size: 11px; color: var(--text-muted); margin-bottom: var(--spacing-xs);">Tags:</div>
                    <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-xs);">
                        ${kb.tags.map(tag => `<span class="badge badge-new">${Utils.escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: var(--spacing-sm);">
                    <button class="btn btn-success btn-sm" onclick="KnowledgeModule.markKBHelpful('${kb.id}', true)">
                        👍 Helpful
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="KnowledgeModule.markKBHelpful('${kb.id}', false)">
                        👎 Not Helpful
                    </button>
                </div>
                <div style="display: flex; gap: var(--spacing-sm);">
                    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn btn-primary" onclick="KnowledgeModule.insertKBToIncident('${kb.id}')">
                        🔗 Link to Incident
                    </button>
                </div>
            </div>
        `;

        if (typeof showModal === 'function') {
            showModal(modalContent);
        }
    },

    /**
     * Show modal form to create a new knowledge article
     */
    createKBArticle: function() {
        const applicabilityCheckboxes = this.applicabilityOptions.map(opt => `
            <label style="display: flex; align-items: center; gap: var(--spacing-xs); cursor: pointer;">
                <input type="checkbox" name="kb-applicability" value="${opt}">
                <span>${opt}</span>
            </label>
        `).join('');

        const categoryOptions = this.categories.map(cat =>
            `<option value="${cat}">${cat}</option>`
        ).join('');

        const modalContent = `
            <div class="modal-header">
                <span><img class="modal-icon" src="icons/book-open.png" alt=""> Create New Knowledge Article</span>
                <button class="panel-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body" style="max-width: 700px; max-height: 75vh; overflow-y: auto;">
                <form id="kb-create-form">
                    <div class="form-group">
                        <label class="form-label required">Title</label>
                        <input type="text" class="form-control" id="kb-title" placeholder="Enter article title" required>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select class="form-control" id="kb-category">
                                ${categoryOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select class="form-control" id="kb-status">
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Content</label>
                        <textarea class="form-control" id="kb-content" rows="12" placeholder="Enter article content (supports markdown-style formatting)..."></textarea>
                        <div style="font-size: 10px; color: var(--text-muted); margin-top: var(--spacing-xs);">
                            Supports: # Headers, **bold**, \`code\`, \`\`\`code blocks\`\`\`, numbered lists (1. item), bullet lists (- item)
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tags (comma separated)</label>
                        <input type="text" class="form-control" id="kb-tags" placeholder="e.g., VPN, Network, Troubleshooting">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Applicability</label>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: var(--spacing-xs); padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: 4px; max-height: 150px; overflow-y: auto;">
                            ${applicabilityCheckboxes}
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Prerequisites</label>
                        <textarea class="form-control" id="kb-prerequisites" rows="3" placeholder="Enter prerequisites (one per line)..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="KnowledgeModule.submitKBArticle()">Create Article</button>
            </div>
        `;

        if (typeof showModal === 'function') {
            showModal(modalContent);
        }
    },

    /**
     * Submit the new KB article form
     */
    submitKBArticle: async function() {
        const title = document.getElementById('kb-title')?.value?.trim();
        const category = document.getElementById('kb-category')?.value;
        const status = document.getElementById('kb-status')?.value;
        const content = document.getElementById('kb-content')?.value || '';
        const tagsInput = document.getElementById('kb-tags')?.value || '';

        if (!title) { showToast('Please enter a title', 'error'); return; }

        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        const applicabilityCheckboxes = document.querySelectorAll('input[name="kb-applicability"]:checked');
        const applicability = Array.from(applicabilityCheckboxes).map(cb => cb.value);

        try {
            const result = await ITSMApi.createKBArticle({
                title, category, content,
                tags: tags.length > 0 ? tags : [category],
                applicability: applicability.length > 0 ? applicability : ['General']
            });
            if (result.success) {
                // If status is Published, publish it
                if (status === 'Published' && result.data?.id) {
                    await ITSMApi.publishKBArticle(result.data.id);
                }
                closeModal();
                showToast(`Knowledge article ${result.data.id} created successfully`, 'success');
                if (typeof currentModule !== 'undefined' && currentModule === 'knowledge-base') {
                    renderModule('knowledge-base');
                }
            } else {
                showToast(result.error || 'Failed to create article', 'error');
            }
        } catch (err) {
            showToast('Failed to create article: ' + err.message, 'error');
        }
    },

    /**
     * Show modal with pre-filled form for editing an existing article
     * @param {string} kbId - Knowledge article ID to edit
     */
    editKBArticle: function(kbId) {
        const kb = ITSMData.knowledgeArticles.find(k => k.id === kbId);
        if (!kb) {
            if (typeof showToast === 'function') {
                showToast('Article not found', 'error');
            }
            return;
        }

        const applicabilityCheckboxes = this.applicabilityOptions.map(opt => `
            <label style="display: flex; align-items: center; gap: var(--spacing-xs); cursor: pointer;">
                <input type="checkbox" name="kb-edit-applicability" value="${opt}" ${kb.applicability && kb.applicability.includes(opt) ? 'checked' : ''}>
                <span>${opt}</span>
            </label>
        `).join('');

        const categoryOptions = this.categories.map(cat =>
            `<option value="${cat}" ${kb.category === cat ? 'selected' : ''}>${cat}</option>`
        ).join('');

        const modalContent = `
            <div class="modal-header">
                <span>📝 Edit Knowledge Article - ${kb.id}</span>
                <button class="panel-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body" style="max-width: 700px; max-height: 75vh; overflow-y: auto;">
                <form id="kb-edit-form">
                    <input type="hidden" id="kb-edit-id" value="${kb.id}">

                    <div class="form-group">
                        <label class="form-label required">Title</label>
                        <input type="text" class="form-control" id="kb-edit-title" value="${Utils.escapeHtml(kb.title)}" required>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select class="form-control" id="kb-edit-category">
                                ${categoryOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select class="form-control" id="kb-edit-status">
                                <option value="Draft" ${kb.status === 'Draft' ? 'selected' : ''}>Draft</option>
                                <option value="Published" ${kb.status === 'Published' ? 'selected' : ''}>Published</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Content</label>
                        <textarea class="form-control" id="kb-edit-content" rows="12">${Utils.escapeHtml(kb.content)}</textarea>
                        <div style="font-size: 10px; color: var(--text-muted); margin-top: var(--spacing-xs);">
                            Supports: # Headers, **bold**, \`code\`, \`\`\`code blocks\`\`\`, numbered lists (1. item), bullet lists (- item)
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tags (comma separated)</label>
                        <input type="text" class="form-control" id="kb-edit-tags" value="${Utils.escapeHtml(kb.tags.join(', '))}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Applicability</label>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: var(--spacing-xs); padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: 4px; max-height: 150px; overflow-y: auto;">
                            ${applicabilityCheckboxes}
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Prerequisites</label>
                        <textarea class="form-control" id="kb-edit-prerequisites" rows="3">${Utils.escapeHtml(kb.prerequisites ? kb.prerequisites.join('\n') : '')}</textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" onclick="KnowledgeModule.deleteKBArticle('${kb.id}')" style="margin-right: auto;">Delete Article</button>
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="KnowledgeModule.saveKBArticle()">Save Changes</button>
            </div>
        `;

        if (typeof showModal === 'function') {
            showModal(modalContent);
        }
    },

    /**
     * Save changes to an edited KB article
     */
    saveKBArticle: async function() {
        const kbId = document.getElementById('kb-edit-id')?.value;
        const title = document.getElementById('kb-edit-title')?.value?.trim();

        if (!title) { showToast('Please enter a title', 'error'); return; }

        const tagsInput = document.getElementById('kb-edit-tags')?.value || '';
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        const prerequisitesInput = document.getElementById('kb-edit-prerequisites')?.value || '';
        const prerequisites = prerequisitesInput.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        const applicabilityCheckboxes = document.querySelectorAll('input[name="kb-edit-applicability"]:checked');
        const applicability = Array.from(applicabilityCheckboxes).map(cb => cb.value);

        const data = {
            title,
            category: document.getElementById('kb-edit-category')?.value,
            status: document.getElementById('kb-edit-status')?.value,
            content: document.getElementById('kb-edit-content')?.value,
            tags: tags.length > 0 ? tags : undefined,
            applicability: applicability.length > 0 ? applicability : undefined,
            prerequisites,
            updatedAt: new Date().toISOString().split('T')[0]
        };

        try {
            await ITSMApi.saveEntity('knowledgeArticles', kbId, data);
            closeModal();
            showToast(`Knowledge article ${kbId} updated successfully`, 'success');
            if (typeof currentModule !== 'undefined' && currentModule === 'knowledge-base') {
                renderModule('knowledge-base');
            }
        } catch (err) {
            showToast('Failed to update article: ' + err.message, 'error');
        }
    },

    /**
     * Delete a KB article
     * @param {string} kbId - Knowledge article ID to delete
     */
    deleteKBArticle: async function(kbId) {
        if (!confirm(`Are you sure you want to delete article ${kbId}? This action cannot be undone.`)) {
            return;
        }

        try {
            await ITSMApi.archiveKBArticle(kbId);
            closeModal();
            showToast(`Knowledge article ${kbId} deleted`, 'success');
            if (typeof currentModule !== 'undefined' && currentModule === 'knowledge-base') {
                renderModule('knowledge-base');
            }
        } catch (err) {
            showToast('Failed to delete article: ' + err.message, 'error');
        }
    },

    /**
     * Mark a KB article as helpful or not helpful
     * @param {string} kbId - Knowledge article ID
     * @param {boolean} isHelpful - True if helpful, false if not helpful
     */
    markKBHelpful: function(kbId, isHelpful) {
        const kb = ITSMData.knowledgeArticles.find(k => k.id === kbId);
        if (!kb) { showToast('Article not found', 'error'); return; }

        // Update locally for immediate feedback
        kb.views = (kb.views || 0) + 1;
        const previousViews = kb.views - 1;
        const voteValue = isHelpful ? 100 : 0;
        if (previousViews > 0) {
            kb.helpful = Math.round(((kb.helpful * previousViews) + voteValue) / kb.views);
        } else {
            kb.helpful = voteValue;
        }
        kb.helpful = Math.max(0, Math.min(100, kb.helpful));

        // Fire-and-forget API call
        ITSMApi.markKBHelpful(kbId).catch(() => {});

        showToast(isHelpful ? 'Thank you for your feedback!' : 'Thank you for your feedback. We will work to improve this article.', 'success');

        const helpfulDisplay = document.querySelector('.kb-metadata');
        if (helpfulDisplay) {
            this.viewKBArticle(kbId);
        }
    },

    /**
     * Insert KB article link to the currently selected incident
     * @param {string} kbId - Knowledge article ID to link
     */
    insertKBToIncident: function(kbId) {
        // Check if there's a selected incident
        if (typeof selectedIncident === 'undefined' || !selectedIncident) {
            if (typeof showToast === 'function') {
                showToast('No incident selected. Please select an incident first.', 'warning');
            }
            return;
        }

        const incident = ITSMData.incidents.find(i => i.id === selectedIncident);
        if (!incident) {
            if (typeof showToast === 'function') {
                showToast('Selected incident not found', 'error');
            }
            return;
        }

        const kb = ITSMData.knowledgeArticles.find(k => k.id === kbId);
        if (!kb) {
            if (typeof showToast === 'function') {
                showToast('Knowledge article not found', 'error');
            }
            return;
        }

        // Initialize linkedKB array if it doesn't exist
        if (!incident.linkedKB) {
            incident.linkedKB = [];
        }

        // Check if already linked
        if (incident.linkedKB.includes(kbId)) {
            if (typeof showToast === 'function') {
                showToast(`Article ${kbId} is already linked to ${incident.id}`, 'warning');
            }
            return;
        }

        // Add the KB article to the incident's linkedKB array
        incident.linkedKB.push(kbId);

        // Update incident's updatedAt timestamp
        incident.updatedAt = new Date().toISOString();

        // Close the modal
        if (typeof closeModal === 'function') {
            closeModal();
        }

        if (typeof showToast === 'function') {
            showToast(`Article ${kbId} linked to ${incident.id}`, 'success');
        }

        // Refresh incident detail if visible
        if (typeof selectIncident === 'function' && selectedIncident) {
            selectIncident(selectedIncident);
        }
    },

    /**
     * Setup event listeners for KB search and category filter
     */
    setupKBSearch: function() {
        const searchInput = document.getElementById('kb-search');
        const categorySelect = document.getElementById('kb-category-filter');

        if (searchInput) {
            // Debounce search input
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const query = e.target.value;
                    const category = categorySelect ? categorySelect.value : '';
                    const filtered = this.searchKB(query, category);

                    const container = document.getElementById('kb-cards-container');
                    if (container) {
                        container.innerHTML = this.renderKBCards(filtered);
                    }
                }, 300);
            });

            // Also trigger search on Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value;
                    const category = categorySelect ? categorySelect.value : '';
                    const filtered = this.searchKB(query, category);

                    const container = document.getElementById('kb-cards-container');
                    if (container) {
                        container.innerHTML = this.renderKBCards(filtered);
                    }
                }
            });
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                const category = e.target.value;
                const query = searchInput ? searchInput.value : '';
                const filtered = this.searchKB(query, category);

                const container = document.getElementById('kb-cards-container');
                if (container) {
                    container.innerHTML = this.renderKBCards(filtered);
                }
            });
        }

        // Setup search button if exists
        const searchButton = document.getElementById('kb-search-btn');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const query = searchInput ? searchInput.value : '';
                const category = categorySelect ? categorySelect.value : '';
                const filtered = this.searchKB(query, category);

                const container = document.getElementById('kb-cards-container');
                if (container) {
                    container.innerHTML = this.renderKBCards(filtered);
                }
            });
        }
    },

    /**
     * Render the full Knowledge Base page (replacement for app.js renderKnowledgeBase)
     * @returns {string} HTML string for the KB page
     */
    renderKnowledgeBasePage: function() {
        const categoryOptions = this.categories.map(cat =>
            `<option value="${cat}">${cat}</option>`
        ).join('');

        return `
            <div class="page-header">
                <div class="page-title"><img class="page-icon" src="icons/book-open.png" alt=""> Knowledge Base</div>
                <div class="page-subtitle">Search and browse knowledge articles for issue resolution</div>
            </div>
            <div class="toolbar">
                <div class="toolbar-group">
                    <button class="btn btn-primary btn-sm" onclick="KnowledgeModule.createKBArticle()">+ New Article</button>
                    <button class="btn btn-secondary btn-sm btn-refresh" onclick="KnowledgeModule.refreshData()" title="Refresh data from server"><img src="icons/refresh-alt.png" alt=""> Refresh</button>
                    <span id="knowledge-bulk-actions"></span>
                </div>
                <div class="toolbar-separator"></div>
                <div class="toolbar-search">
                    <input type="text" placeholder="Search knowledge base..." id="kb-search" style="width: 300px;">
                    <button class="btn btn-primary btn-sm" id="kb-search-btn">🔍 Search</button>
                </div>
                <div class="toolbar-group" style="margin-left: var(--spacing-lg);">
                    <select class="form-control" style="width: 150px; padding: 4px;" id="kb-category-filter">
                        <option value="">All Categories</option>
                        ${categoryOptions}
                    </select>
                </div>
            </div>
            <div class="page-content">
                <div id="kb-cards-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: var(--spacing-md);">
                    ${this.renderKBCards(ITSMData.knowledgeArticles)}
                </div>
            </div>
        `;
    },

    // ── Selection & Bulk Operations ──

    toggleSelection: function(id) {
        if (this.selectedIds.has(id)) this.selectedIds.delete(id);
        else this.selectedIds.add(id);
        const card = document.querySelector(`.kb-card[data-kb-id="${id}"]`);
        if (card) card.classList.toggle('row-selected', this.selectedIds.has(id));
        this.updateBulkActions();
    },

    toggleSelectAll: function() {
        const articles = ITSMData.knowledgeArticles;
        const allChecked = articles.length > 0 && articles.every(a => this.selectedIds.has(a.id));
        articles.forEach(a => { if (allChecked) this.selectedIds.delete(a.id); else this.selectedIds.add(a.id); });
        document.querySelectorAll('.row-check-knowledge').forEach(cb => {
            cb.checked = this.selectedIds.has(cb.value);
            const card = cb.closest('.kb-card');
            if (card) card.classList.toggle('row-selected', cb.checked);
        });
        this.updateBulkActions();
    },

    updateBulkActions: function() {
        const el = document.getElementById('knowledge-bulk-actions');
        if (!el) return;
        const n = this.selectedIds.size;
        el.innerHTML = n > 0
            ? `<button class="btn btn-danger btn-sm" onclick="KnowledgeModule.deleteSelected()">Delete Selected (${n})</button>`
            : '';
    },

    refreshData: async function() {
        const btn = document.querySelector('.btn-refresh');
        if (btn) btn.classList.add('refreshing');
        try {
            await ITSMApi.loadCollection('knowledgeArticles');
            this.selectedIds.clear();
            const container = document.getElementById('kb-cards-container');
            if (container) container.innerHTML = this.renderKBCards(ITSMData.knowledgeArticles);
            if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
            showToast('Knowledge base refreshed', 'success');
        } catch (err) {
            showToast('Failed to refresh: ' + err.message, 'error');
        } finally {
            if (btn) btn.classList.remove('refreshing');
        }
    },

    deleteSelected: function() {
        const ids = Array.from(this.selectedIds);
        if (ids.length === 0) return;
        showModal(`
            <div class="modal-header"><span>Delete ${ids.length} Article${ids.length !== 1 ? 's' : ''}</span><button class="panel-close" onclick="closeModal()">x</button></div>
            <div class="modal-body" style="width:450px;">
                <p>Are you sure you want to permanently delete:</p>
                <div style="margin:var(--spacing-sm) 0;padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:4px;max-height:150px;overflow-y:auto;font-family:monospace;font-size:12px;">${ids.join(', ')}</div>
                <p style="color:#cc4444;font-size:12px;">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-danger" onclick="KnowledgeModule.confirmDeleteSelected()">Delete</button>
            </div>
        `);
    },

    confirmDeleteSelected: async function() {
        const ids = Array.from(this.selectedIds);
        closeModal();
        try {
            const result = await ITSMApi.bulkDelete('knowledge', ids);
            if (result.success) {
                this.selectedIds.clear();
                const container = document.getElementById('kb-cards-container');
                if (container) container.innerHTML = this.renderKBCards(ITSMData.knowledgeArticles);
                if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
                showToast(`Deleted ${result.deleted.length} article(s)`, 'success');
            }
        } catch (err) {
            showToast('Failed to delete: ' + err.message, 'error');
        }
    },

    /**
     * Initialize the KB module (call after DOM is ready)
     */
    init: function() {
        // Setup search listeners after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.setupKBSearch();
        }, 100);
    }
};

// Export to window for global access
window.KnowledgeModule = KnowledgeModule;

// Also provide a standalone viewKBArticle function for backward compatibility with app.js
window.viewKBArticle = function(kbId) {
    KnowledgeModule.viewKBArticle(kbId);
};

// Provide insertKBToIncident for backward compatibility
window.insertKBToIncident = function(kbId) {
    KnowledgeModule.insertKBToIncident(kbId);
};
