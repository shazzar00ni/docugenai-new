// ==================== //
// STATE MANAGEMENT     //
// ==================== //

let uploadedFiles = [];
let generatedWebsite = null;

// ==================== //
// DOM ELEMENTS         //
// ==================== //

const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const filesList = document.getElementById("filesList");
const generateBtn = document.getElementById("generateBtn");
const previewSection = document.getElementById("previewSection");
const previewFrame = document.getElementById("previewFrame");
const downloadBtn = document.getElementById("downloadBtn");
const editBtn = document.getElementById("editBtn");
const navbar = document.getElementById("navbar");

// ==================== //
// NAVBAR SCROLL        //
// ==================== //

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// ==================== //
// FILE UPLOAD          //
// ==================== //

// Click to upload
uploadArea.addEventListener("click", () => {
  fileInput.click();
});

// Prevent default drag behaviors
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  uploadArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight drop area
["dragenter", "dragover"].forEach((eventName) => {
  uploadArea.addEventListener(
    eventName,
    () => {
      uploadArea.classList.add("drag-over");
    },
    false
  );
});

["dragleave", "drop"].forEach((eventName) => {
  uploadArea.addEventListener(
    eventName,
    () => {
      uploadArea.classList.remove("drag-over");
    },
    false
  );
});

// Handle dropped files
uploadArea.addEventListener(
  "drop",
  (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  },
  false
);

// Handle selected files
fileInput.addEventListener("change", (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  const mdFiles = [...files].filter(
    (file) => file.name.endsWith(".md") || file.name.endsWith(".markdown")
  );

  if (mdFiles.length === 0) {
    alert("Please upload only Markdown (.md or .markdown) files");
    return;
  }

  mdFiles.forEach((file) => {
    if (!uploadedFiles.find((f) => f.name === file.name)) {
      uploadedFiles.push(file);
    }
  });

  renderFilesList();

  if (uploadedFiles.length > 0) {
    generateBtn.style.display = "flex";
  }
}

function renderFilesList() {
  filesList.innerHTML = "";

  uploadedFiles.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";

    const fileSize = formatFileSize(file.size);

    fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M11 2H5C4.46957 2 3.96086 2.21071 3.58579 2.58579C3.21071 2.96086 3 3.46957 3 4V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H15C15.5304 18 16.0391 17.7893 16.4142 17.4142C16.7893 17.0391 17 16.5304 17 16V8L11 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M11 2V8H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
            </div>
            <button class="file-remove" onclick="removeFile(${index})">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;

    filesList.appendChild(fileItem);
  });
}

function removeFile(index) {
  uploadedFiles.splice(index, 1);
  renderFilesList();

  if (uploadedFiles.length === 0) {
    generateBtn.style.display = "none";
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// ==================== //
// GENERATE WEBSITE     //
// ==================== //

generateBtn.addEventListener("click", async () => {
  generateBtn.disabled = true;
  const originalText = generateBtn.innerHTML;
  generateBtn.innerHTML = `
        <div class="loading-spinner"></div>
        <span>Generating...</span>
    `;

  try {
    // Read all markdown files
    const fileContents = await Promise.all(
      uploadedFiles.map((file) => readFileContent(file))
    );

    // Process with AI
    const website = await generateWebsiteFromMarkdown(fileContents);

    // Show preview
    generatedWebsite = website;
    displayPreview(website);

    // Scroll to preview
    previewSection.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error generating website:", error);
    alert("Error generating website. Please try again.");
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = originalText;
  }
});

function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) =>
      resolve({
        name: file.name,
        content: e.target.result,
      });
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function generateWebsiteFromMarkdown(files) {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Parse markdown files and extract structure
  const pages = files.map((file) => parseMarkdownFile(file));

  // Generate navigation
  const navigation = generateNavigation(pages);

  // Generate HTML
  const html = generateHTML(pages, navigation);

  return html;
}

function parseMarkdownFile(file) {
  const lines = file.content.split("\n");
  const page = {
    title: file.name.replace(/\.md$|\.markdown$/, ""),
    sections: [],
    content: file.content,
  };

  // Extract title from first H1
  const h1Match = file.content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    page.title = h1Match[1];
  }

  // Extract sections from H2 headers
  const h2Regex = /^##\s+(.+)$/gm;
  let match;
  while ((match = h2Regex.exec(file.content)) !== null) {
    page.sections.push({
      title: match[1],
      id: slugify(match[1]),
    });
  }

  return page;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function generateNavigation(pages) {
  return pages.map((page) => ({
    title: page.title,
    id: slugify(page.title),
    sections: page.sections,
  }));
}

function generateHTML(pages, navigation) {
  const navHTML = navigation
    .map(
      (item) => `
        <a href="#${item.id}" class="doc-nav-link">${item.title}</a>
    `
    )
    .join("");

  const contentHTML = pages
    .map((page) => {
      const htmlContent = markdownToHTML(page.content);
      return `
            <section id="${slugify(page.title)}" class="doc-section">
                ${htmlContent}
            </section>
        `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pages[0]?.title || "Documentation"}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary: #667EEA;
            --secondary: #764BA2;
            --text: #1F2937;
            --text-light: #6B7280;
            --bg: #FFFFFF;
            --bg-secondary: #F9FAFB;
            --border: #E5E7EB;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: var(--bg);
        }
        
        .doc-container {
            display: grid;
            grid-template-columns: 250px 1fr;
            min-height: 100vh;
        }
        
        .doc-sidebar {
            background: var(--bg-secondary);
            border-right: 1px solid var(--border);
            padding: 2rem;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
        }
        
        .doc-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 2rem;
        }
        
        .doc-nav {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .doc-nav-link {
            color: var(--text-light);
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            transition: all 0.2s;
        }
        
        .doc-nav-link:hover {
            background: white;
            color: var(--primary);
        }
        
        .doc-content {
            max-width: 800px;
            padding: 3rem;
        }
        
        .doc-section {
            margin-bottom: 4rem;
        }
        
        h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        h2 {
            font-size: 2rem;
            font-weight: 700;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: var(--text);
        }
        
        h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
        }
        
        p {
            margin-bottom: 1rem;
            color: var(--text-light);
            line-height: 1.8;
        }
        
        code {
            background: var(--bg-secondary);
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.875rem;
            color: var(--primary);
        }
        
        pre {
            background: var(--text);
            color: #F9FAFB;
            padding: 1.5rem;
            border-radius: 0.75rem;
            overflow-x: auto;
            margin: 1.5rem 0;
        }
        
        pre code {
            background: transparent;
            color: inherit;
            padding: 0;
        }
        
        ul, ol {
            margin-left: 1.5rem;
            margin-bottom: 1rem;
            color: var(--text-light);
        }
        
        li {
            margin-bottom: 0.5rem;
        }
        
        a {
            color: var(--primary);
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        blockquote {
            border-left: 4px solid var(--primary);
            padding-left: 1rem;
            margin: 1.5rem 0;
            color: var(--text-light);
            font-style: italic;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
        }
        
        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }
        
        th {
            background: var(--bg-secondary);
            font-weight: 600;
        }
        
        @media (max-width: 768px) {
            .doc-container {
                grid-template-columns: 1fr;
            }
            
            .doc-sidebar {
                position: static;
                height: auto;
                border-right: none;
                border-bottom: 1px solid var(--border);
            }
            
            .doc-content {
                padding: 2rem 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="doc-container">
        <aside class="doc-sidebar">
            <div class="doc-logo">📚 Docs</div>
            <nav class="doc-nav">
                ${navHTML}
            </nav>
        </aside>
        <main class="doc-content">
            ${contentHTML}
        </main>
    </div>
</body>
</html>
    `;
}

function markdownToHTML(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Code blocks
  html = html.replace(
    /```(\w+)?\n([\s\S]+?)```/g,
    "<pre><code>$2</code></pre>"
  );

  // Inline code
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Unordered lists
  html = html.replace(/^\* (.+)$/gm, "<li>$1</li>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Paragraphs
  html = html.replace(/^(?!<[hupol]|```|>)(.+)$/gm, "<p>$1</p>");

  // Clean up multiple consecutive tags
  html = html.replace(/<\/ul>\s*<ul>/g, "");
  html = html.replace(/<\/ol>\s*<ol>/g, "");

  return html;
}

function displayPreview(html) {
  previewSection.style.display = "block";

  // Create a blob URL for the HTML
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  previewFrame.src = url;
}

// ==================== //
// DOWNLOAD WEBSITE     //
// ==================== //

downloadBtn.addEventListener("click", () => {
  if (!generatedWebsite) {
    alert("Please generate a website first");
    return;
  }

  // Create a blob and download
  const blob = new Blob([generatedWebsite], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "documentation.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// ==================== //
// EDIT CONTENT         //
// ==================== //

editBtn.addEventListener("click", () => {
  // Scroll back to upload section
  document.getElementById("upload").scrollIntoView({ behavior: "smooth" });
});

// ==================== //
// SMOOTH SCROLLING     //
// ==================== //

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});
