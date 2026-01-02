// ==================== //
// SEARCH ENGINE        //
// ==================== //

class SearchEngine {
    constructor() {
        this.index = [];
        this.searchResults = [];
        this.init();
    }

    init() {
        this.createSearchUI();
        this.setupEventListeners();
    }

    createSearchUI() {
        // Add search to navbar
        const navbar = document.querySelector('.nav-links');
        if (!navbar) return;

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <button class="search-toggle" id="searchToggle">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2"/>
                    <path d="M14 14L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="search-modal" id="searchModal" style="display: none;">
                <div class="search-modal-content">
                    <div class="search-input-wrapper">
                        <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2"/>
                            <path d="M14 14L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <input type="text" 
                               class="search-input" 
                               id="searchInput" 
                               placeholder="Search documentation..."
                               autocomplete="off">
                        <button class="search-close" id="searchClose">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="search-results" id="searchResults"></div>
                    <div class="search-footer">
                        <span class="search-hint">
                            <kbd>↑</kbd><kbd>↓</kbd> Navigate
                            <kbd>Enter</kbd> Select
                            <kbd>Esc</kbd> Close
                        </span>
                    </div>
                </div>
            </div>
        `;

        navbar.insertBefore(searchContainer, navbar.children[1]);
        this.addSearchStyles();
    }

    setupEventListeners() {
        const searchToggle = document.getElementById('searchToggle');
        const searchModal = document.getElementById('searchModal');
        const searchInput = document.getElementById('searchInput');
        const searchClose = document.getElementById('searchClose');

        if (!searchToggle) return;

        // Toggle search modal
        searchToggle.addEventListener('click', () => {
            this.openSearch();
        });

        // Close search
        searchClose.addEventListener('click', () => {
            this.closeSearch();
        });

        // Search input
        searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K to open search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }

            // Escape to close
            if (e.key === 'Escape' && searchModal.style.display === 'flex') {
                this.closeSearch();
            }

            // Arrow navigation
            if (searchModal.style.display === 'flex') {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateResults(1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateResults(-1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.selectResult();
                }
            }
        });

        // Click outside to close
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                this.closeSearch();
            }
        });
    }

    openSearch() {
        const searchModal = document.getElementById('searchModal');
        const searchInput = document.getElementById('searchInput');
        
        searchModal.style.display = 'flex';
        searchInput.focus();
        
        // Load index if not already loaded
        if (this.index.length === 0) {
            this.buildIndex();
        }
    }

    closeSearch() {
        const searchModal = document.getElementById('searchModal');
        const searchInput = document.getElementById('searchInput');
        
        searchModal.style.display = 'none';
        searchInput.value = '';
        this.clearResults();
    }

    async buildIndex() {
        // Build search index from uploaded files or generated content
        if (uploadedFiles && uploadedFiles.length > 0) {
            const fileContents = await Promise.all(
                uploadedFiles.map(file => this.readFileForIndex(file))
            );
            
            this.index = await aiService.generateSearchIndex(fileContents);
        }
    }

    readFileForIndex(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const h1Match = content.match(/^#\s+(.+)$/m);
                const title = h1Match ? h1Match[1] : file.name;

                resolve({
                    id: slugify(file.name),
                    title: title,
                    content: content,
                    filename: file.name
                });
            };
            reader.readAsText(file);
        });
    }

    performSearch(query) {
        if (query.length < CONFIG.search.minQueryLength) {
            this.clearResults();
            return;
        }

        const results = this.search(query);
        this.displayResults(results, query);
    }

    search(query) {
        const queryLower = query.toLowerCase();
        const results = [];

        this.index.forEach(item => {
            let score = 0;
            const titleLower = item.title.toLowerCase();
            const contentLower = item.content.toLowerCase();

            // Title exact match
            if (titleLower === queryLower) {
                score += 100;
            }
            // Title contains query
            else if (titleLower.includes(queryLower)) {
                score += 50;
            }
            // Title word match
            else if (titleLower.split(/\s+/).some(word => word.includes(queryLower))) {
                score += 25;
            }

            // Content matches
            const contentMatches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
            score += contentMatches * 2;

            // Keyword matches
            if (item.keywords && item.keywords.includes(queryLower)) {
                score += 10;
            }

            if (score > 0) {
                // Extract context
                const context = this.extractContext(item.content, query);
                
                results.push({
                    ...item,
                    score,
                    context
                });
            }
        });

        // Sort by score
        results.sort((a, b) => b.score - a.score);
        
        return results.slice(0, CONFIG.search.maxResults);
    }

    extractContext(content, query, contextLength = 150) {
        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();
        const index = contentLower.indexOf(queryLower);

        if (index === -1) {
            return content.substring(0, contextLength) + '...';
        }

        const start = Math.max(0, index - contextLength / 2);
        const end = Math.min(content.length, index + query.length + contextLength / 2);
        
        let context = content.substring(start, end);
        
        if (start > 0) context = '...' + context;
        if (end < content.length) context = context + '...';

        return context;
    }

    displayResults(results, query) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="20" cy="20" r="12" stroke="currentColor" stroke-width="3"/>
                        <path d="M30 30L42 42" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                    <p>No results found for "${query}"</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = results.map((result, index) => `
            <div class="search-result-item ${index === 0 ? 'selected' : ''}" 
                 data-index="${index}"
                 data-id="${result.id}">
                <div class="search-result-title">${this.highlightQuery(result.title, query)}</div>
                <div class="search-result-context">${this.highlightQuery(result.context, query)}</div>
                ${result.filename ? `<div class="search-result-meta">${result.filename}</div>` : ''}
            </div>
        `).join('');

        // Add click handlers
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateToResult(item.dataset.id);
            });
        });

        this.searchResults = results;
    }

    highlightQuery(text, query) {
        if (!CONFIG.search.highlightMatches) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    clearResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        this.searchResults = [];
    }

    navigateResults(direction) {
        const items = document.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        const currentIndex = Array.from(items).findIndex(item => 
            item.classList.contains('selected')
        );

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;

        items[currentIndex]?.classList.remove('selected');
        items[newIndex]?.classList.add('selected');
        items[newIndex]?.scrollIntoView({ block: 'nearest' });
    }

    selectResult() {
        const selected = document.querySelector('.search-result-item.selected');
        if (selected) {
            this.navigateToResult(selected.dataset.id);
        }
    }

    navigateToResult(id) {
        this.closeSearch();
        
        // Navigate to the result in preview or generated site
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            // If in preview iframe
            const previewFrame = document.getElementById('previewFrame');
            if (previewFrame && previewFrame.contentWindow) {
                const targetElement = previewFrame.contentWindow.document.getElementById(id);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }

    addSearchStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .search-container {
                position: relative;
            }

            .search-toggle {
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                padding: 0.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                color: var(--text-primary);
                transition: all var(--transition-base);
            }

            .search-toggle:hover {
                background: var(--bg-card-hover);
                transform: scale(1.05);
            }

            .search-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 10000;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 10vh;
                animation: fadeIn 0.2s ease-out;
            }

            .search-modal-content {
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-xl);
                width: 90%;
                max-width: 600px;
                max-height: 70vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                animation: slideDown 0.3s ease-out;
            }

            .search-input-wrapper {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1.5rem;
                border-bottom: 1px solid var(--border);
            }

            .search-icon {
                color: var(--text-muted);
                flex-shrink: 0;
            }

            .search-input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                font-size: 1.125rem;
                color: var(--text-primary);
                font-family: var(--font-primary);
            }

            .search-input::placeholder {
                color: var(--text-muted);
            }

            .search-close {
                background: transparent;
                border: none;
                padding: 0.5rem;
                cursor: pointer;
                color: var(--text-muted);
                border-radius: var(--radius-sm);
                transition: all var(--transition-fast);
            }

            .search-close:hover {
                background: var(--bg-card-hover);
                color: var(--text-primary);
            }

            .search-results {
                flex: 1;
                overflow-y: auto;
                padding: 0.5rem;
            }

            .search-result-item {
                padding: 1rem;
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all var(--transition-fast);
                border: 1px solid transparent;
            }

            .search-result-item:hover,
            .search-result-item.selected {
                background: var(--bg-card-hover);
                border-color: var(--primary);
            }

            .search-result-title {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
            }

            .search-result-context {
                font-size: 0.875rem;
                color: var(--text-muted);
                line-height: 1.5;
            }

            .search-result-context mark {
                background: rgba(102, 126, 234, 0.3);
                color: var(--primary);
                padding: 0.125rem 0.25rem;
                border-radius: 0.25rem;
            }

            .search-result-meta {
                font-size: 0.75rem;
                color: var(--text-muted);
                margin-top: 0.5rem;
            }

            .search-no-results {
                padding: 3rem;
                text-align: center;
                color: var(--text-muted);
            }

            .search-no-results svg {
                margin-bottom: 1rem;
                opacity: 0.5;
            }

            .search-footer {
                padding: 1rem 1.5rem;
                border-top: 1px solid var(--border);
            }

            .search-hint {
                font-size: 0.75rem;
                color: var(--text-muted);
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .search-hint kbd {
                background: var(--bg-darker);
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-family: monospace;
                font-size: 0.75rem;
                border: 1px solid var(--border);
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize search engine
let searchEngine;
document.addEventListener('DOMContentLoaded', () => {
    searchEngine = new SearchEngine();
});
