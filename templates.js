// ==================== //
// TEMPLATE MANAGER     //
// ==================== //

class TemplateManager {
    constructor() {
        this.templates = CONFIG.templates;
        this.currentTemplate = localStorage.getItem('selected_template') || 'modern';
    }

    getTemplate(templateName) {
        return this.templates[templateName] || this.templates.modern;
    }

    generateHTML(pages, navigation, templateName = this.currentTemplate) {
        switch(templateName) {
            case 'modern':
                return this.generateModernTemplate(pages, navigation);
            case 'minimal':
                return this.generateMinimalTemplate(pages, navigation);
            case 'technical':
                return this.generateTechnicalTemplate(pages, navigation);
            case 'blog':
                return this.generateBlogTemplate(pages, navigation);
            case 'wiki':
                return this.generateWikiTemplate(pages, navigation);
            default:
                return this.generateModernTemplate(pages, navigation);
        }
    }

    generateModernTemplate(pages, navigation) {
        const navHTML = navigation.map(item => `
            <a href="#${item.id}" class="doc-nav-link">${item.title}</a>
            ${item.sections && item.sections.length > 0 ? `
                <div class="doc-nav-subsections">
                    ${item.sections.map(section => `
                        <a href="#${section.id}" class="doc-nav-sublink">${section.title}</a>
                    `).join('')}
                </div>
            ` : ''}
        `).join('');

        const contentHTML = pages.map(page => {
            const htmlContent = markdownToHTML(page.content);
            return `
                <section id="${slugify(page.title)}" class="doc-section">
                    ${htmlContent}
                </section>
            `;
        }).join('');

        return this.wrapTemplate(navHTML, contentHTML, 'modern');
    }

    generateMinimalTemplate(pages, navigation) {
        const navHTML = navigation.map(item => `
            <a href="#${item.id}" class="minimal-nav-link">${item.title}</a>
        `).join('');

        const contentHTML = pages.map(page => {
            const htmlContent = markdownToHTML(page.content);
            return `
                <article id="${slugify(page.title)}" class="minimal-article">
                    ${htmlContent}
                </article>
            `;
        }).join('');

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pages[0]?.title || 'Documentation'}</title>
    ${this.getMinimalStyles()}
</head>
<body>
    <nav class="minimal-nav">
        ${navHTML}
    </nav>
    <main class="minimal-main">
        ${contentHTML}
    </main>
</body>
</html>
        `;
    }

    generateTechnicalTemplate(pages, navigation) {
        const navHTML = navigation.map(item => `
            <div class="tech-nav-item">
                <a href="#${item.id}" class="tech-nav-link">
                    <span class="tech-nav-icon">📄</span>
                    <span>${item.title}</span>
                </a>
                ${item.sections && item.sections.length > 0 ? `
                    <div class="tech-nav-sections">
                        ${item.sections.map(section => `
                            <a href="#${section.id}" class="tech-nav-section">${section.title}</a>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');

        const contentHTML = pages.map(page => {
            const htmlContent = markdownToHTML(page.content);
            return `
                <section id="${slugify(page.title)}" class="tech-section">
                    ${htmlContent}
                </section>
            `;
        }).join('');

        return this.wrapTemplate(navHTML, contentHTML, 'technical');
    }

    generateBlogTemplate(pages, navigation) {
        const contentHTML = pages.map((page, index) => {
            const htmlContent = markdownToHTML(page.content);
            return `
                <article id="${slugify(page.title)}" class="blog-post ${index === 0 ? 'featured' : ''}">
                    <div class="blog-post-header">
                        <h1 class="blog-post-title">${page.title}</h1>
                        <div class="blog-post-meta">
                            <span class="blog-post-date">${new Date().toLocaleDateString()}</span>
                            <span class="blog-post-reading-time">${this.estimateReadingTime(page.content)} min read</span>
                        </div>
                    </div>
                    <div class="blog-post-content">
                        ${htmlContent}
                    </div>
                </article>
            `;
        }).join('');

        return this.wrapTemplate('', contentHTML, 'blog');
    }

    generateWikiTemplate(pages, navigation) {
        const navHTML = `
            <div class="wiki-toc">
                <h3>Contents</h3>
                ${navigation.map(item => `
                    <div class="wiki-toc-item">
                        <a href="#${item.id}">${item.title}</a>
                        ${item.sections && item.sections.length > 0 ? `
                            <ul class="wiki-toc-sections">
                                ${item.sections.map(section => `
                                    <li><a href="#${section.id}">${section.title}</a></li>
                                `).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;

        const contentHTML = pages.map(page => {
            const htmlContent = markdownToHTML(page.content);
            return `
                <section id="${slugify(page.title)}" class="wiki-section">
                    ${htmlContent}
                </section>
            `;
        }).join('');

        return this.wrapTemplate(navHTML, contentHTML, 'wiki');
    }

    wrapTemplate(navHTML, contentHTML, templateType) {
        const styles = this.getTemplateStyles(templateType);
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation</title>
    <style>${styles}</style>
</head>
<body class="template-${templateType}">
    <div class="doc-container">
        ${navHTML ? `<aside class="doc-sidebar">${navHTML}</aside>` : ''}
        <main class="doc-content">
            ${contentHTML}
        </main>
    </div>
    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Active link highlighting
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    document.querySelectorAll('.doc-nav-link, .tech-nav-link, .wiki-toc a').forEach(link => {
                        link.classList.remove('active');
                    });
                    const activeLink = document.querySelector(\`a[href="#\${id}"]\`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });
    </script>
</body>
</html>
        `;
    }

    getTemplateStyles(templateType) {
        const baseStyles = `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            :root {
                --primary: ${themeManager?.getThemeColors().primary || '#667EEA'};
                --secondary: ${themeManager?.getThemeColors().secondary || '#764BA2'};
                --text: ${themeManager?.getThemeColors().textPrimary || '#1F2937'};
                --text-light: ${themeManager?.getThemeColors().textMuted || '#6B7280'};
                --bg: ${themeManager?.getThemeColors().bgDark || '#FFFFFF'};
                --bg-secondary: ${themeManager?.getThemeColors().bgDarker || '#F9FAFB'};
                --border: ${themeManager?.getThemeColors().border || '#E5E7EB'};
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: var(--text);
                background: var(--bg);
            }
            .doc-container { display: grid; min-height: 100vh; }
            h1, h2, h3, h4, h5, h6 { margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; }
            h1 { font-size: 2.5rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            h2 { font-size: 2rem; }
            h3 { font-size: 1.5rem; }
            p { margin-bottom: 1rem; color: var(--text-light); line-height: 1.8; }
            code { background: var(--bg-secondary); padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: 'Monaco', monospace; font-size: 0.875rem; color: var(--primary); }
            pre { background: #1F2937; color: #F9FAFB; padding: 1.5rem; border-radius: 0.75rem; overflow-x: auto; margin: 1.5rem 0; }
            pre code { background: transparent; color: inherit; padding: 0; }
            ul, ol { margin-left: 1.5rem; margin-bottom: 1rem; color: var(--text-light); }
            li { margin-bottom: 0.5rem; }
            a { color: var(--primary); text-decoration: none; }
            a:hover { text-decoration: underline; }
            blockquote { border-left: 4px solid var(--primary); padding-left: 1rem; margin: 1.5rem 0; color: var(--text-light); font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
            th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
            th { background: var(--bg-secondary); font-weight: 600; }
        `;

        const templateSpecificStyles = {
            modern: `
                .doc-container { grid-template-columns: 250px 1fr; }
                .doc-sidebar { background: var(--bg-secondary); border-right: 1px solid var(--border); padding: 2rem; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
                .doc-nav-link { display: block; color: var(--text-light); padding: 0.5rem 1rem; border-radius: 0.5rem; transition: all 0.2s; margin-bottom: 0.25rem; }
                .doc-nav-link:hover, .doc-nav-link.active { background: var(--bg); color: var(--primary); text-decoration: none; }
                .doc-nav-subsections { margin-left: 1rem; margin-top: 0.25rem; }
                .doc-nav-sublink { display: block; color: var(--text-light); padding: 0.25rem 1rem; font-size: 0.875rem; border-radius: 0.25rem; transition: all 0.2s; }
                .doc-nav-sublink:hover { background: var(--bg); color: var(--primary); text-decoration: none; }
                .doc-content { max-width: 800px; padding: 3rem; }
                .doc-section { margin-bottom: 4rem; }
                @media (max-width: 768px) {
                    .doc-container { grid-template-columns: 1fr; }
                    .doc-sidebar { position: static; height: auto; border-right: none; border-bottom: 1px solid var(--border); }
                }
            `,
            minimal: `
                .minimal-nav { background: var(--bg); border-bottom: 1px solid var(--border); padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; }
                .minimal-nav-link { color: var(--text-light); margin-right: 2rem; font-weight: 500; transition: color 0.2s; }
                .minimal-nav-link:hover { color: var(--primary); text-decoration: none; }
                .minimal-main { max-width: 700px; margin: 0 auto; padding: 4rem 2rem; }
                .minimal-article { margin-bottom: 6rem; }
            `,
            technical: `
                .doc-container { grid-template-columns: 280px 1fr; }
                .doc-sidebar { background: #1F2937; color: #F9FAFB; padding: 2rem; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
                .tech-nav-item { margin-bottom: 1rem; }
                .tech-nav-link { display: flex; align-items: center; gap: 0.5rem; color: #D1D5DB; padding: 0.75rem; border-radius: 0.5rem; transition: all 0.2s; font-weight: 500; }
                .tech-nav-link:hover, .tech-nav-link.active { background: #374151; color: #FFFFFF; text-decoration: none; }
                .tech-nav-icon { font-size: 1.25rem; }
                .tech-nav-sections { margin-left: 2rem; margin-top: 0.5rem; }
                .tech-nav-section { display: block; color: #9CA3AF; padding: 0.5rem; font-size: 0.875rem; border-radius: 0.25rem; transition: all 0.2s; }
                .tech-nav-section:hover { background: #374151; color: #D1D5DB; text-decoration: none; }
                .doc-content { max-width: 900px; padding: 3rem; }
                .tech-section { margin-bottom: 4rem; }
            `,
            blog: `
                .doc-container { grid-template-columns: 1fr; }
                .doc-content { max-width: 800px; margin: 0 auto; padding: 4rem 2rem; }
                .blog-post { margin-bottom: 6rem; }
                .blog-post.featured { border-bottom: 2px solid var(--primary); padding-bottom: 4rem; }
                .blog-post-header { margin-bottom: 2rem; }
                .blog-post-title { font-size: 3rem; margin-bottom: 1rem; }
                .blog-post-meta { display: flex; gap: 2rem; color: var(--text-light); font-size: 0.875rem; }
                .blog-post-content { font-size: 1.125rem; line-height: 1.8; }
            `,
            wiki: `
                .doc-container { grid-template-columns: 250px 1fr 200px; }
                .doc-sidebar { background: var(--bg-secondary); border-right: 1px solid var(--border); padding: 2rem; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
                .wiki-toc h3 { margin-bottom: 1rem; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-light); }
                .wiki-toc-item { margin-bottom: 1rem; }
                .wiki-toc-item > a { display: block; color: var(--text); padding: 0.5rem; border-radius: 0.25rem; font-weight: 500; transition: all 0.2s; }
                .wiki-toc-item > a:hover, .wiki-toc-item > a.active { background: var(--bg); color: var(--primary); text-decoration: none; }
                .wiki-toc-sections { list-style: none; margin-left: 1rem; margin-top: 0.5rem; }
                .wiki-toc-sections a { display: block; color: var(--text-light); padding: 0.25rem 0.5rem; font-size: 0.875rem; transition: all 0.2s; }
                .wiki-toc-sections a:hover { color: var(--primary); text-decoration: none; }
                .doc-content { max-width: 900px; padding: 3rem; }
                .wiki-section { margin-bottom: 4rem; }
            `
        };

        return baseStyles + (templateSpecificStyles[templateType] || templateSpecificStyles.modern);
    }

    getMinimalStyles() {
        return `<style>${this.getTemplateStyles('minimal')}</style>`;
    }

    estimateReadingTime(content) {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }

    setCurrentTemplate(templateName) {
        this.currentTemplate = templateName;
        localStorage.setItem('selected_template', templateName);
    }

    getCurrentTemplate() {
        return this.currentTemplate;
    }
}

// Initialize template manager
const templateManager = new TemplateManager();
