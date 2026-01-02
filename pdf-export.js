// ==================== //
// PDF EXPORT SERVICE   //
// ==================== //

class PDFExporter {
    constructor() {
        this.config = CONFIG.pdf;
    }

    async exportToPDF(content, options = {}) {
        const {
            filename = `documentation-${Date.now()}.pdf`,
            title = 'Documentation',
            includeTableOfContents = true,
            includeCoverPage = true
        } = options;

        try {
            // Method 1: Use browser's print to PDF (most compatible)
            if (window.print) {
                this.printToPDF(content, title);
                return;
            }

            // Method 2: Use jsPDF library (if available)
            if (typeof jsPDF !== 'undefined') {
                await this.exportWithJsPDF(content, filename, title);
                return;
            }

            // Fallback: Download as HTML with print styles
            this.downloadPrintableHTML(content, filename);

        } catch (error) {
            console.error('PDF Export Error:', error);
            throw new Error('Failed to export PDF: ' + error.message);
        }
    }

    printToPDF(content, title) {
        // Create a new window with print-optimized content
        const printWindow = window.open('', '_blank');
        
        const printContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        @page {
            size: ${this.config.format};
            margin: ${this.config.margin.top} ${this.config.margin.right} ${this.config.margin.bottom} ${this.config.margin.left};
        }

        @media print {
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #1F2937;
                font-size: 11pt;
            }

            h1 {
                font-size: 24pt;
                margin-top: 0;
                margin-bottom: 12pt;
                page-break-after: avoid;
            }

            h2 {
                font-size: 18pt;
                margin-top: 18pt;
                margin-bottom: 9pt;
                page-break-after: avoid;
            }

            h3 {
                font-size: 14pt;
                margin-top: 12pt;
                margin-bottom: 6pt;
                page-break-after: avoid;
            }

            p {
                margin-bottom: 9pt;
                orphans: 3;
                widows: 3;
            }

            pre, code {
                font-family: 'Courier New', monospace;
                font-size: 9pt;
                background: #F3F4F6;
                page-break-inside: avoid;
            }

            pre {
                padding: 12pt;
                border: 1px solid #E5E7EB;
                border-radius: 4pt;
                margin: 12pt 0;
            }

            code {
                padding: 2pt 4pt;
                border-radius: 2pt;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin: 12pt 0;
                page-break-inside: avoid;
            }

            th, td {
                padding: 6pt;
                border: 1pt solid #E5E7EB;
                text-align: left;
            }

            th {
                background: #F3F4F6;
                font-weight: 600;
            }

            a {
                color: #667EEA;
                text-decoration: none;
            }

            a[href]:after {
                content: " (" attr(href) ")";
                font-size: 9pt;
                color: #6B7280;
            }

            blockquote {
                border-left: 3pt solid #667EEA;
                padding-left: 12pt;
                margin: 12pt 0;
                font-style: italic;
                color: #6B7280;
            }

            ul, ol {
                margin-left: 24pt;
                margin-bottom: 9pt;
            }

            li {
                margin-bottom: 4pt;
            }

            img {
                max-width: 100%;
                page-break-inside: avoid;
            }

            .page-break {
                page-break-before: always;
            }

            .no-print {
                display: none;
            }

            @page :first {
                margin-top: 0;
            }

            header, footer {
                font-size: 9pt;
                color: #6B7280;
            }
        }

        /* Screen styles */
        @media screen {
            body {
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
            }

            .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 24px;
                background: #667EEA;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .print-button:hover {
                background: #5568D3;
            }
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>
    ${content}
</body>
</html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Auto-trigger print dialog after content loads
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 250);
        };
    }

    async exportWithJsPDF(content, filename, title) {
        // This would use jsPDF library if loaded
        // For now, we'll use the print method
        console.warn('jsPDF not loaded, falling back to print method');
        this.printToPDF(content, title);
    }

    downloadPrintableHTML(content, filename) {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Documentation</title>
    <style>
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
        }
        h1, h2, h3 { margin-top: 2rem; margin-bottom: 1rem; }
        pre { background: #F3F4F6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
        code { background: #F3F4F6; padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
    </style>
</head>
<body>
    ${content}
    <script>
        // Auto-print on load
        window.onload = () => {
            if (confirm('Ready to print/save as PDF?')) {
                window.print();
            }
        };
    </script>
</body>
</html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace('.pdf', '.html');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateTableOfContents(content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const headings = doc.querySelectorAll('h1, h2, h3');
        
        if (headings.length === 0) return '';

        let toc = '<div class="table-of-contents page-break"><h2>Table of Contents</h2><ul>';
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.substring(1));
            const text = heading.textContent;
            const id = `heading-${index}`;
            heading.id = id;
            
            const indent = '  '.repeat(level - 1);
            toc += `${indent}<li><a href="#${id}">${text}</a></li>`;
        });
        
        toc += '</ul></div>';
        return toc;
    }

    generateCoverPage(title, subtitle = '') {
        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
        <div class="cover-page page-break" style="text-align: center; padding: 4rem 0;">
            <h1 style="font-size: 36pt; margin-bottom: 1rem;">${title}</h1>
            ${subtitle ? `<h2 style="font-size: 18pt; color: #6B7280; margin-bottom: 2rem;">${subtitle}</h2>` : ''}
            <p style="color: #6B7280; margin-top: 4rem;">Generated on ${date}</p>
            <p style="color: #6B7280;">Powered by DocuGenAI</p>
        </div>
        `;
    }
}

// Initialize PDF exporter
const pdfExporter = new PDFExporter();
