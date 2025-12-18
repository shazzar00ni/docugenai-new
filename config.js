// ==================== //
// CONFIGURATION        //
// ==================== //

const CONFIG = {
    // API Configuration
    api: {
        openai: {
            endpoint: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-4',
            // API key should be set by user in settings
            apiKey: localStorage.getItem('openai_api_key') || ''
        },
        firebase: {
            apiKey: "YOUR_FIREBASE_API_KEY",
            authDomain: "docugenai.firebaseapp.com",
            projectId: "docugenai",
            storageBucket: "docugenai.appspot.com",
            messagingSenderId: "YOUR_SENDER_ID",
            appId: "YOUR_APP_ID"
        }
    },

    // Theme Configuration
    themes: {
        dark: {
            name: 'Dark',
            colors: {
                primary: '#667EEA',
                secondary: '#764BA2',
                bgDark: '#0F1117',
                bgDarker: '#0A0B0F',
                bgCard: '#1A1B23',
                bgCardHover: '#22232E',
                textPrimary: '#F9FAFB',
                textSecondary: '#D1D5DB',
                textMuted: '#6B7280',
                border: 'rgba(255, 255, 255, 0.1)'
            }
        },
        light: {
            name: 'Light',
            colors: {
                primary: '#667EEA',
                secondary: '#764BA2',
                bgDark: '#FFFFFF',
                bgDarker: '#F9FAFB',
                bgCard: '#FFFFFF',
                bgCardHover: '#F3F4F6',
                textPrimary: '#111827',
                textSecondary: '#374151',
                textMuted: '#6B7280',
                border: 'rgba(0, 0, 0, 0.1)'
            }
        },
        ocean: {
            name: 'Ocean',
            colors: {
                primary: '#0EA5E9',
                secondary: '#06B6D4',
                bgDark: '#0C1222',
                bgDarker: '#070B15',
                bgCard: '#1A2332',
                bgCardHover: '#243447',
                textPrimary: '#F0F9FF',
                textSecondary: '#BAE6FD',
                textMuted: '#7DD3FC',
                border: 'rgba(14, 165, 233, 0.2)'
            }
        },
        forest: {
            name: 'Forest',
            colors: {
                primary: '#10B981',
                secondary: '#059669',
                bgDark: '#0A1F15',
                bgDarker: '#051810',
                bgCard: '#1A2F23',
                bgCardHover: '#244032',
                textPrimary: '#ECFDF5',
                textSecondary: '#A7F3D0',
                textMuted: '#6EE7B7',
                border: 'rgba(16, 185, 129, 0.2)'
            }
        },
        sunset: {
            name: 'Sunset',
            colors: {
                primary: '#F59E0B',
                secondary: '#EF4444',
                bgDark: '#1F1108',
                bgDarker: '#150A05',
                bgCard: '#2F1F18',
                bgCardHover: '#3F2A20',
                textPrimary: '#FEF3C7',
                textSecondary: '#FDE68A',
                textMuted: '#FCD34D',
                border: 'rgba(245, 158, 11, 0.2)'
            }
        }
    },

    // Template Configuration
    templates: {
        modern: {
            name: 'Modern',
            description: 'Clean, modern design with sidebar navigation',
            preview: 'modern-preview.png'
        },
        minimal: {
            name: 'Minimal',
            description: 'Minimalist design focused on content',
            preview: 'minimal-preview.png'
        },
        technical: {
            name: 'Technical',
            description: 'Technical documentation with code highlighting',
            preview: 'technical-preview.png'
        },
        blog: {
            name: 'Blog Style',
            description: 'Blog-like layout with featured content',
            preview: 'blog-preview.png'
        },
        wiki: {
            name: 'Wiki',
            description: 'Wikipedia-style knowledge base',
            preview: 'wiki-preview.png'
        }
    },

    // Language Configuration
    languages: {
        en: {
            name: 'English',
            code: 'en',
            flag: '🇺🇸'
        },
        es: {
            name: 'Español',
            code: 'es',
            flag: '🇪🇸'
        },
        fr: {
            name: 'Français',
            code: 'fr',
            flag: '🇫🇷'
        },
        de: {
            name: 'Deutsch',
            code: 'de',
            flag: '🇩🇪'
        },
        zh: {
            name: '中文',
            code: 'zh',
            flag: '🇨🇳'
        },
        ja: {
            name: '日本語',
            code: 'ja',
            flag: '🇯🇵'
        },
        pt: {
            name: 'Português',
            code: 'pt',
            flag: '🇵🇹'
        }
    },

    // Editor Configuration
    editor: {
        autosave: true,
        autosaveInterval: 30000, // 30 seconds
        theme: 'dark',
        fontSize: 14,
        lineNumbers: true,
        wordWrap: true,
        minimap: false
    },

    // Search Configuration
    search: {
        minQueryLength: 2,
        maxResults: 50,
        highlightMatches: true,
        fuzzySearch: true
    },

    // PDF Export Configuration
    pdf: {
        format: 'A4',
        margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm'
        },
        displayHeaderFooter: true,
        printBackground: true
    },

    // Storage Configuration
    storage: {
        provider: 'firebase', // 'firebase', 'local', or 'none'
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedExtensions: ['.md', '.markdown', '.txt']
    },

    // Feature Flags
    features: {
        aiEnhancement: true,
        liveEditor: true,
        templateSelection: true,
        themeCustomization: true,
        pdfExport: true,
        cloudStorage: true,
        authentication: true,
        search: true,
        multiLanguage: true,
        collaboration: false, // Future feature
        analytics: false // Future feature
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
