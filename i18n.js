// ==================== //
// INTERNATIONALIZATION //
// ==================== //

class I18nService {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations(this.currentLanguage);
        this.applyTranslations();
        this.setupLanguageSelector();
    }

    async loadTranslations(languageCode) {
        // In a real app, these would be loaded from JSON files
        this.translations = {
            en: {
                // Navigation
                'nav.features': 'Features',
                'nav.howItWorks': 'How It Works',
                'nav.getStarted': 'Get Started',
                'nav.signIn': 'Sign In',
                'nav.signOut': 'Sign Out',

                // Hero Section
                'hero.badge': 'AI-Powered Documentation',
                'hero.title': 'Transform Your Docs into',
                'hero.titleGradient': 'Beautiful Websites',
                'hero.description': 'Upload your Markdown files and watch as AI instantly converts them into a stunning, fully-functional documentation website. No coding required.',
                'hero.cta.primary': 'Start Creating',
                'hero.cta.secondary': 'See How It Works',
                'hero.stats.docsGenerated': 'Docs Generated',
                'hero.stats.developers': 'Happy Developers',
                'hero.stats.uptime': 'Uptime',

                // Features
                'features.title': 'Powerful Features',
                'features.description': 'Everything you need to create stunning documentation websites',
                'feature.fast.title': 'Lightning Fast',
                'feature.fast.description': 'Generate your documentation website in seconds with our AI-powered engine',
                'feature.smart.title': 'Smart Organization',
                'feature.smart.description': 'AI automatically structures your content with intelligent navigation',
                'feature.themes.title': 'Beautiful Themes',
                'feature.themes.description': 'Choose from premium themes or let AI design one based on your content',
                'feature.responsive.title': 'Responsive Design',
                'feature.responsive.description': 'Your docs look perfect on every device, from mobile to desktop',
                'feature.seo.title': 'SEO Optimized',
                'feature.seo.description': 'Built-in SEO best practices to help your docs rank higher',
                'feature.export.title': 'Export Anywhere',
                'feature.export.description': 'Download your generated site or deploy directly to popular platforms',

                // Upload
                'upload.title': 'Upload Your Documentation',
                'upload.description': 'Drop your Markdown files here to get started',
                'upload.dragDrop': 'Drag & Drop Files',
                'upload.orClick': 'or click to browse',
                'upload.hint': 'Supports .md and .markdown files',
                'upload.generate': 'Generate Website',

                // Preview
                'preview.title': 'Preview Your Website',
                'preview.edit': 'Edit Content',
                'preview.download': 'Download Website',
                'preview.exportPDF': 'Export as PDF',

                // Editor
                'editor.placeholder': 'Start writing your documentation in Markdown...',
                'editor.wordCount': 'words',
                'editor.saved': 'Saved',
                'editor.unsaved': 'Unsaved',

                // Search
                'search.placeholder': 'Search documentation...',
                'search.noResults': 'No results found for',
                'search.hint.navigate': 'Navigate',
                'search.hint.select': 'Select',
                'search.hint.close': 'Close',

                // Auth
                'auth.signIn': 'Sign In',
                'auth.signUp': 'Sign Up',
                'auth.email': 'Email',
                'auth.password': 'Password',
                'auth.displayName': 'Display Name',
                'auth.forgotPassword': 'Forgot Password?',
                'auth.signInWithGoogle': 'Sign in with Google',
                'auth.noAccount': "Don't have an account?",
                'auth.haveAccount': 'Already have an account?',

                // Settings
                'settings.title': 'Settings',
                'settings.theme': 'Theme',
                'settings.language': 'Language',
                'settings.template': 'Template',
                'settings.apiKey': 'OpenAI API Key',
                'settings.save': 'Save Settings',

                // Common
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                'common.cancel': 'Cancel',
                'common.confirm': 'Confirm',
                'common.delete': 'Delete',
                'common.edit': 'Edit',
                'common.save': 'Save',
                'common.close': 'Close'
            },
            es: {
                'nav.features': 'Características',
                'nav.howItWorks': 'Cómo Funciona',
                'nav.getStarted': 'Comenzar',
                'hero.title': 'Transforma tus Documentos en',
                'hero.titleGradient': 'Sitios Web Hermosos',
                'hero.description': 'Sube tus archivos Markdown y observa cómo la IA los convierte instantáneamente en un sitio web de documentación impresionante y completamente funcional. No se requiere codificación.',
                'hero.cta.primary': 'Comenzar a Crear',
                'hero.cta.secondary': 'Ver Cómo Funciona',
                'features.title': 'Características Poderosas',
                'upload.title': 'Sube tu Documentación',
                'upload.dragDrop': 'Arrastra y Suelta Archivos',
                'upload.generate': 'Generar Sitio Web'
            },
            fr: {
                'nav.features': 'Fonctionnalités',
                'nav.howItWorks': 'Comment Ça Marche',
                'nav.getStarted': 'Commencer',
                'hero.title': 'Transformez Vos Documents en',
                'hero.titleGradient': 'Beaux Sites Web',
                'hero.description': 'Téléchargez vos fichiers Markdown et regardez l\'IA les convertir instantanément en un site web de documentation magnifique et entièrement fonctionnel. Aucun codage requis.',
                'hero.cta.primary': 'Commencer à Créer',
                'features.title': 'Fonctionnalités Puissantes',
                'upload.title': 'Téléchargez Votre Documentation'
            },
            de: {
                'nav.features': 'Funktionen',
                'nav.howItWorks': 'Wie Es Funktioniert',
                'nav.getStarted': 'Loslegen',
                'hero.title': 'Verwandeln Sie Ihre Dokumente in',
                'hero.titleGradient': 'Schöne Websites',
                'hero.description': 'Laden Sie Ihre Markdown-Dateien hoch und sehen Sie zu, wie KI sie sofort in eine atemberaubende, voll funktionsfähige Dokumentations-Website verwandelt. Keine Programmierung erforderlich.',
                'features.title': 'Leistungsstarke Funktionen',
                'upload.title': 'Laden Sie Ihre Dokumentation Hoch'
            },
            zh: {
                'nav.features': '功能',
                'nav.howItWorks': '工作原理',
                'nav.getStarted': '开始使用',
                'hero.title': '将您的文档转换为',
                'hero.titleGradient': '精美网站',
                'hero.description': '上传您的 Markdown 文件，观看 AI 立即将它们转换为令人惊叹的、功能齐全的文档网站。无需编码。',
                'hero.cta.primary': '开始创建',
                'features.title': '强大功能',
                'upload.title': '上传您的文档'
            },
            ja: {
                'nav.features': '機能',
                'nav.howItWorks': '使い方',
                'nav.getStarted': '始める',
                'hero.title': 'ドキュメントを',
                'hero.titleGradient': '美しいウェブサイトに変換',
                'hero.description': 'Markdownファイルをアップロードすると、AIが即座に素晴らしい完全機能のドキュメントウェブサイトに変換します。コーディング不要。',
                'hero.cta.primary': '作成を開始',
                'features.title': '強力な機能',
                'upload.title': 'ドキュメントをアップロード'
            },
            pt: {
                'nav.features': 'Recursos',
                'nav.howItWorks': 'Como Funciona',
                'nav.getStarted': 'Começar',
                'hero.title': 'Transforme Seus Documentos em',
                'hero.titleGradient': 'Sites Lindos',
                'hero.description': 'Carregue seus arquivos Markdown e observe a IA convertê-los instantaneamente em um site de documentação deslumbrante e totalmente funcional. Sem necessidade de codificação.',
                'features.title': 'Recursos Poderosos',
                'upload.title': 'Carregue Sua Documentação'
            }
        };

        this.currentTranslations = this.translations[languageCode] || this.translations.en;
    }

    t(key, fallback = key) {
        return this.currentTranslations[key] || this.translations.en[key] || fallback;
    }

    async setLanguage(languageCode) {
        this.currentLanguage = languageCode;
        localStorage.setItem('language', languageCode);
        await this.loadTranslations(languageCode);
        this.applyTranslations();
        
        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: languageCode }
        }));

        // If AI is configured, translate content
        if (aiService.isConfigured() && CONFIG.features.multiLanguage) {
            this.translatePageContent(languageCode);
        }
    }

    applyTranslations() {
        // Apply translations to elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
    }

    async translatePageContent(targetLanguage) {
        // This would use AI to translate dynamic content
        // For now, we'll just update static translations
        console.log(`Translating content to ${targetLanguage}`);
    }

    setupLanguageSelector() {
        const navbar = document.querySelector('.nav-links');
        if (!navbar) return;

        const langSelector = document.createElement('div');
        langSelector.className = 'language-selector';
        langSelector.innerHTML = `
            <button class="language-toggle" id="languageToggle">
                <span class="language-flag">${CONFIG.languages[this.currentLanguage].flag}</span>
                <span class="language-code">${this.currentLanguage.toUpperCase()}</span>
            </button>
            <div class="language-dropdown" id="languageDropdown" style="display: none;">
                ${Object.entries(CONFIG.languages).map(([code, lang]) => `
                    <button class="language-option ${code === this.currentLanguage ? 'active' : ''}" 
                            data-language="${code}">
                        <span class="language-flag">${lang.flag}</span>
                        <span class="language-name">${lang.name}</span>
                    </button>
                `).join('')}
            </div>
        `;

        navbar.insertBefore(langSelector, navbar.children[2]);

        // Event listeners
        const toggleBtn = document.getElementById('languageToggle');
        const dropdown = document.getElementById('languageDropdown');

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });

        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.dataset.language;
                this.setLanguage(lang);
                
                // Update active state
                document.querySelectorAll('.language-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
                
                // Update toggle button
                toggleBtn.querySelector('.language-flag').textContent = CONFIG.languages[lang].flag;
                toggleBtn.querySelector('.language-code').textContent = lang.toUpperCase();
                
                dropdown.style.display = 'none';
            });
        });

        this.addLanguageStyles();
    }

    addLanguageStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .language-selector {
                position: relative;
            }

            .language-toggle {
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                padding: 0.5rem 0.75rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: var(--text-primary);
                transition: all var(--transition-base);
                font-family: var(--font-primary);
            }

            .language-toggle:hover {
                background: var(--bg-card-hover);
                transform: scale(1.05);
            }

            .language-flag {
                font-size: 1.25rem;
            }

            .language-code {
                font-weight: 600;
                font-size: 0.875rem;
            }

            .language-dropdown {
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

            .language-option {
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

            .language-option:hover {
                background: var(--bg-card-hover);
                border-color: var(--border);
            }

            .language-option.active {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                border-color: var(--primary);
            }

            .language-name {
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return Object.keys(this.translations);
    }
}

// Initialize i18n service
let i18nService;
document.addEventListener('DOMContentLoaded', () => {
    i18nService = new I18nService();
});
