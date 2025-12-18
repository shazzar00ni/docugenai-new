// ==================== //
// THEME MANAGER        //
// ==================== //

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.themes = CONFIG.themes;
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) {
            console.error(`Theme ${themeName} not found`);
            return;
        }

        const root = document.documentElement;
        
        // Apply theme colors
        Object.entries(theme.colors).forEach(([key, value]) => {
            const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            root.style.setProperty(`--${cssVar}`, value);
        });

        // Update body class
        document.body.className = `theme-${themeName}`;
        
        // Save preference
        this.currentTheme = themeName;
        localStorage.setItem('theme', themeName);

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: themeName } 
        }));
    }

    toggleTheme() {
        const themes = Object.keys(this.themes);
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.applyTheme(themes[nextIndex]);
    }

    setupThemeToggle() {
        // Create theme selector in navbar
        const navbar = document.querySelector('.nav-links');
        if (!navbar) return;

        const themeSelector = document.createElement('div');
        themeSelector.className = 'theme-selector';
        themeSelector.innerHTML = `
            <button class="theme-toggle-btn" id="themeToggle" title="Change Theme">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2V4M10 16V18M4 10H2M18 10H16M15.657 15.657L14.243 14.243M15.657 4.343L14.243 5.757M4.343 15.657L5.757 14.243M4.343 4.343L5.757 5.757" 
                          stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
            </button>
            <div class="theme-dropdown" id="themeDropdown" style="display: none;">
                ${Object.entries(this.themes).map(([key, theme]) => `
                    <button class="theme-option ${key === this.currentTheme ? 'active' : ''}" 
                            data-theme="${key}">
                        <span class="theme-preview" style="background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})"></span>
                        <span class="theme-name">${theme.name}</span>
                    </button>
                `).join('')}
            </div>
        `;

        navbar.insertBefore(themeSelector, navbar.firstChild);

        // Add event listeners
        const toggleBtn = document.getElementById('themeToggle');
        const dropdown = document.getElementById('themeDropdown');

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });

        // Theme option click handlers
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const themeName = option.dataset.theme;
                this.applyTheme(themeName);
                
                // Update active state
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
                
                dropdown.style.display = 'none';
            });
        });

        // Add styles
        this.addThemeStyles();
    }

    addThemeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .theme-selector {
                position: relative;
            }

            .theme-toggle-btn {
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                padding: 0.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-primary);
                transition: all var(--transition-base);
            }

            .theme-toggle-btn:hover {
                background: var(--bg-card-hover);
                transform: scale(1.05);
            }

            .theme-dropdown {
                position: absolute;
                top: calc(100% + 0.5rem);
                right: 0;
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                padding: 0.5rem;
                min-width: 200px;
                box-shadow: var(--shadow-xl);
                z-index: 1000;
                animation: slideDown 0.2s ease-out;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .theme-option {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                width: 100%;
                padding: 0.75rem;
                background: transparent;
                border: 1px solid transparent;
                border-radius: var(--radius-sm);
                cursor: pointer;
                transition: all var(--transition-fast);
                color: var(--text-primary);
                font-family: var(--font-primary);
            }

            .theme-option:hover {
                background: var(--bg-card-hover);
                border-color: var(--border);
            }

            .theme-option.active {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                border-color: var(--primary);
            }

            .theme-preview {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .theme-name {
                font-weight: 500;
            }

            /* Light theme specific overrides */
            .theme-light {
                --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                --shadow-glow: 0 0 40px rgba(102, 126, 234, 0.2);
            }

            .theme-light .gradient-orb {
                opacity: 0.15;
            }

            .theme-light .hero-background {
                background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
            }
        `;
        document.head.appendChild(style);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getThemeColors(themeName = this.currentTheme) {
        return this.themes[themeName]?.colors || this.themes.dark.colors;
    }
}

// Initialize theme manager
let themeManager;
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
});
