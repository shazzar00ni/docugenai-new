// ==================== //
// LIVE MARKDOWN EDITOR //
// ==================== //

class MarkdownEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.content = '';
        this.autosaveTimer = null;
        this.init();
    }

    init() {
        this.createEditor();
        this.setupEventListeners();
        if (CONFIG.editor.autosave) {
            this.startAutosave();
        }
    }

    createEditor() {
        this.container.innerHTML = `
            <div class="editor-container">
                <div class="editor-toolbar">
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-action="bold" title="Bold (Ctrl+B)">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4 2H9C10.1046 2 11 2.89543 11 4C11 5.10457 10.1046 6 9 6H4V2Z" stroke="currentColor" stroke-width="1.5"/>
                                <path d="M4 6H10C11.1046 6 12 6.89543 12 8C12 9.10457 11.1046 10 10 10H4V6Z" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                        </button>
                        <button class="toolbar-btn" data-action="italic" title="Italic (Ctrl+I)">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 2H12M4 14H10M10 2L6 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </button>
                        <button class="toolbar-btn" data-action="code" title="Code">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M5 4L2 8L5 12M11 4L14 8L11 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="toolbar-divider"></div>
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-action="h1" title="Heading 1">H1</button>
                        <button class="toolbar-btn" data-action="h2" title="Heading 2">H2</button>
                        <button class="toolbar-btn" data-action="h3" title="Heading 3">H3</button>
                    </div>
                    <div class="toolbar-divider"></div>
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-action="link" title="Link">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 9L10 5M7 13L9 11C10.6569 9.34315 10.6569 6.65685 9 5C7.34315 3.34315 4.65685 3.34315 3 5L1 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </button>
                        <button class="toolbar-btn" data-action="image" title="Image">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                                <circle cx="5.5" cy="5.5" r="1.5" stroke="currentColor" stroke-width="1.5"/>
                                <path d="M14 10L11 7L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </button>
                        <button class="toolbar-btn" data-action="list" title="List">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 4H14M6 8H14M6 12H14M2 4H3M2 8H3M2 12H3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="toolbar-divider"></div>
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-action="ai-enhance" title="AI Enhance">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="toolbar-btn" data-action="preview" title="Toggle Preview">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" stroke-width="1.5"/>
                                <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                        </button>
                    </div>
                    <div class="toolbar-spacer"></div>
                    <div class="editor-status">
                        <span class="word-count">0 words</span>
                        <span class="save-status">Saved</span>
                    </div>
                </div>
                <div class="editor-main">
                    <div class="editor-pane">
                        <textarea class="markdown-input" placeholder="Start writing your documentation in Markdown..."></textarea>
                    </div>
                    <div class="preview-pane" style="display: none;">
                        <div class="preview-content"></div>
                    </div>
                </div>
            </div>
        `;

        this.textarea = this.container.querySelector('.markdown-input');
        this.previewPane = this.container.querySelector('.preview-pane');
        this.previewContent = this.container.querySelector('.preview-content');
        this.wordCount = this.container.querySelector('.word-count');
        this.saveStatus = this.container.querySelector('.save-status');
    }

    setupEventListeners() {
        // Toolbar actions
        this.container.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.executeAction(action);
            });
        });

        // Text input
        this.textarea.addEventListener('input', () => {
            this.content = this.textarea.value;
            this.updateWordCount();
            this.updatePreview();
            this.markUnsaved();
            
            if (CONFIG.editor.autosave) {
                this.scheduleAutosave();
            }
        });

        // Keyboard shortcuts
        this.textarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'b':
                        e.preventDefault();
                        this.executeAction('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.executeAction('italic');
                        break;
                    case 's':
                        e.preventDefault();
                        this.save();
                        break;
                }
            }
        });

        // Tab key for indentation
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.insertText('    ');
            }
        });
    }

    executeAction(action) {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const selectedText = this.textarea.value.substring(start, end);

        let replacement = '';

        switch(action) {
            case 'bold':
                replacement = `**${selectedText || 'bold text'}**`;
                break;
            case 'italic':
                replacement = `*${selectedText || 'italic text'}*`;
                break;
            case 'code':
                replacement = `\`${selectedText || 'code'}\``;
                break;
            case 'h1':
                replacement = `# ${selectedText || 'Heading 1'}`;
                break;
            case 'h2':
                replacement = `## ${selectedText || 'Heading 2'}`;
                break;
            case 'h3':
                replacement = `### ${selectedText || 'Heading 3'}`;
                break;
            case 'link':
                replacement = `[${selectedText || 'link text'}](url)`;
                break;
            case 'image':
                replacement = `![${selectedText || 'alt text'}](image-url)`;
                break;
            case 'list':
                replacement = `- ${selectedText || 'list item'}`;
                break;
            case 'preview':
                this.togglePreview();
                return;
            case 'ai-enhance':
                this.aiEnhance();
                return;
        }

        this.replaceSelection(replacement);
    }

    replaceSelection(text) {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const before = this.textarea.value.substring(0, start);
        const after = this.textarea.value.substring(end);
        
        this.textarea.value = before + text + after;
        this.textarea.selectionStart = start;
        this.textarea.selectionEnd = start + text.length;
        this.textarea.focus();
        
        this.content = this.textarea.value;
        this.updateWordCount();
        this.updatePreview();
        this.markUnsaved();
    }

    insertText(text) {
        const start = this.textarea.selectionStart;
        const before = this.textarea.value.substring(0, start);
        const after = this.textarea.value.substring(start);
        
        this.textarea.value = before + text + after;
        this.textarea.selectionStart = this.textarea.selectionEnd = start + text.length;
        
        this.content = this.textarea.value;
        this.updateWordCount();
    }

    togglePreview() {
        const editorPane = this.container.querySelector('.editor-pane');
        const isPreviewVisible = this.previewPane.style.display !== 'none';

        if (isPreviewVisible) {
            this.previewPane.style.display = 'none';
            editorPane.style.width = '100%';
        } else {
            this.previewPane.style.display = 'block';
            editorPane.style.width = '50%';
            this.updatePreview();
        }
    }

    updatePreview() {
        if (this.previewPane.style.display !== 'none') {
            this.previewContent.innerHTML = markdownToHTML(this.content);
        }
    }

    updateWordCount() {
        const words = this.content.trim().split(/\s+/).filter(w => w.length > 0).length;
        this.wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    }

    markUnsaved() {
        this.saveStatus.textContent = 'Unsaved';
        this.saveStatus.style.color = '#F59E0B';
    }

    markSaved() {
        this.saveStatus.textContent = 'Saved';
        this.saveStatus.style.color = '#10B981';
    }

    scheduleAutosave() {
        if (this.autosaveTimer) {
            clearTimeout(this.autosaveTimer);
        }
        this.autosaveTimer = setTimeout(() => {
            this.save();
        }, CONFIG.editor.autosaveInterval);
    }

    startAutosave() {
        setInterval(() => {
            if (this.saveStatus.textContent === 'Unsaved') {
                this.save();
            }
        }, CONFIG.editor.autosaveInterval);
    }

    save() {
        // Save to localStorage
        const timestamp = new Date().toISOString();
        const savedContent = {
            content: this.content,
            timestamp: timestamp
        };
        
        localStorage.setItem('editor_content', JSON.stringify(savedContent));
        this.markSaved();

        // Dispatch save event
        window.dispatchEvent(new CustomEvent('editorSaved', {
            detail: { content: this.content, timestamp }
        }));
    }

    load() {
        const saved = localStorage.getItem('editor_content');
        if (saved) {
            try {
                const { content } = JSON.parse(saved);
                this.setContent(content);
                return true;
            } catch (e) {
                console.error('Failed to load saved content:', e);
            }
        }
        return false;
    }

    setContent(content) {
        this.content = content;
        this.textarea.value = content;
        this.updateWordCount();
        this.updatePreview();
        this.markSaved();
    }

    getContent() {
        return this.content;
    }

    clear() {
        this.setContent('');
        localStorage.removeItem('editor_content');
    }

    async aiEnhance() {
        if (!aiService.isConfigured()) {
            alert('Please configure your OpenAI API key in settings first.');
            return;
        }

        const btn = this.container.querySelector('[data-action="ai-enhance"]');
        btn.disabled = true;
        btn.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const enhanced = await aiService.enhanceDocumentation(this.content, {
                improveStructure: true,
                addExamples: true,
                enhanceClarity: true
            });

            this.setContent(enhanced);
            this.markUnsaved();
        } catch (error) {
            alert('AI enhancement failed: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
            `;
        }
    }

    exportAsMarkdown() {
        const blob = new Blob([this.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
