// AI System Design Generator - Main Application Script

class SystemDesignGenerator {
    constructor() {
        this.apiKey = '';
        this.currentMermaidCode = '';
        this.isGenerating = false;
        this.liveUpdateTimeout = null;
        this.zoomLevel = 1;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.panOffset = { x: 0, y: 0 };
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    init() {
        this.initializeTheme();
        this.loadApiKey();
        this.setupEventListeners();
        this.initializeMermaid();
        this.loadExamples();
        this.testMermaidBasic();
    }

    // Test basic Mermaid functionality
    async testMermaidBasic() {
        try {
            const testCode = 'graph TD\n    A[Test] --> B[Working]';
            await mermaid.render('test-basic', testCode);
            console.log('✅ Mermaid is working correctly');
        } catch (error) {
            console.error('❌ Mermaid initialization failed:', error);
        }
    }

    // API Key Management
    loadApiKey() {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            this.apiKey = this.decryptApiKey(savedKey);
            document.getElementById('apiKey').value = this.apiKey;
        }
    }

    saveApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        this.apiKey = apiKeyInput.value.trim();
        
        if (this.apiKey) {
            localStorage.setItem('gemini_api_key', this.encryptApiKey(this.apiKey));
        } else {
            localStorage.removeItem('gemini_api_key');
        }
    }

    // Basic encryption/decryption for API key (security through obscurity)
    encryptApiKey(key) {
        return btoa(key.split('').reverse().join(''));
    }

    decryptApiKey(encryptedKey) {
        try {
            return atob(encryptedKey).split('').reverse().join('');
        } catch (e) {
            return '';
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // API Key toggle
        document.getElementById('toggleApiKey').addEventListener('click', this.toggleApiKeyVisibility.bind(this));
        document.getElementById('apiKey').addEventListener('input', this.saveApiKey.bind(this));

        // Generate button
        document.getElementById('generateBtn').addEventListener('click', this.generateDiagram.bind(this));
        
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', this.clearAll.bind(this));

        // Remove test functionality

        // Live code editor
        document.getElementById('mermaidCodeEditor').addEventListener('input', this.handleCodeChange.bind(this));
        document.getElementById('mermaidCodeEditor').addEventListener('keydown', this.handleCodeKeydown.bind(this));

        // Copy code button
        document.getElementById('copyCodeBtn').addEventListener('click', this.copyMermaidCode.bind(this));

        // Format code button
        document.getElementById('formatCodeBtn').addEventListener('click', this.formatMermaidCode.bind(this));

        // Download buttons
        document.getElementById('downloadSvgBtn').addEventListener('click', () => this.downloadDiagram('svg'));
        document.getElementById('downloadPngBtn').addEventListener('click', () => this.downloadDiagram('png'));

        // Refresh diagram button
        document.getElementById('refreshDiagramBtn').addEventListener('click', this.refreshDiagram.bind(this));

        // Zoom controls
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoom(0.8));
        document.getElementById('zoomResetBtn').addEventListener('click', () => this.resetZoom());

        // Pan functionality
        this.setupPanControls();

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', this.toggleTheme.bind(this));

        // Remove example items functionality

        // Enter key in textarea
        document.getElementById('systemDescription').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.generateDiagram();
            }
        });
    }

    // Initialize Mermaid
    initializeMermaid() {
        // Set initial theme based on current theme
        this.updateMermaidTheme();
    }

    // UI Helper Functions
    toggleApiKeyVisibility() {
        const apiKeyInput = document.getElementById('apiKey');
        const toggleBtn = document.getElementById('toggleApiKey');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleBtn.textContent = 'Hide';
        } else {
            apiKeyInput.type = 'password';
            toggleBtn.textContent = 'Show';
        }
    }

    // Handle live code editing
    handleCodeChange(event) {
        const code = event.target.value;
        this.currentMermaidCode = code;
        
        // Clear previous timeout
        if (this.liveUpdateTimeout) {
            clearTimeout(this.liveUpdateTimeout);
        }
        
        // Debounced update after 1 second of no typing
        this.liveUpdateTimeout = setTimeout(() => {
            if (code.trim() && this.isValidMermaidCode(code)) {
                this.renderDiagramLive(code);
            }
        }, 1000);
    }

    handleCodeKeydown(event) {
        // Tab key support for indentation
        if (event.key === 'Tab') {
            event.preventDefault();
            const textarea = event.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            
            // Insert tab
            textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 4;
            
            // Trigger change event
            this.handleCodeChange(event);
        }
        
        // Ctrl+Enter to refresh diagram immediately
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            this.refreshDiagram();
        }
    }

    // Live diagram rendering (non-blocking)
    async renderDiagramLive(code) {
        try {
            const diagramContainer = document.getElementById('diagramContainer');
            const diagramId = 'live-diagram-' + Date.now();
            
            const { svg } = await mermaid.render(diagramId, code);
            diagramContainer.innerHTML = svg;
            
            // Maintain current zoom and pan
            const svgElement = diagramContainer.querySelector('svg');
            if (svgElement) {
                svgElement.removeAttribute('width');
                svgElement.removeAttribute('height');
                
                if (!svgElement.getAttribute('viewBox')) {
                    const bbox = svgElement.getBBox();
                    svgElement.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
                }
                
                svgElement.style.maxWidth = 'none';
                svgElement.style.height = 'auto';
                svgElement.style.display = 'block';
            }
            
            // Apply current zoom/pan
            this.updateZoom();
        } catch (error) {
            // Don't show errors for live updates to avoid spam
            console.warn('Live update failed:', error.message);
        }
    }

    // Manual refresh diagram
    async refreshDiagram() {
        const code = document.getElementById('mermaidCodeEditor').value.trim();
        if (!code) return;
        
        try {
            await this.renderDiagram(code);
        } catch (error) {
            this.showError('Failed to render diagram: ' + error.message);
        }
    }

    // Zoom functionality
    zoom(factor) {
        this.zoomLevel *= factor;
        this.zoomLevel = Math.max(0.1, Math.min(5, this.zoomLevel)); // Clamp between 10% and 500%
        this.updateZoom();
    }

    resetZoom() {
        this.zoomLevel = 1;
        this.panOffset = { x: 0, y: 0 };
        this.updateZoom();
    }

    updateZoom() {
        const container = document.getElementById('diagramContainer');
        const zoomLevel = document.getElementById('zoomLevel');
        
        container.style.transform = `translate(${this.panOffset.x}px, ${this.panOffset.y}px) scale(${this.zoomLevel})`;
        zoomLevel.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }

    // Pan functionality
    setupPanControls() {
        const container = document.getElementById('diagramContainer');
        
        container.addEventListener('mousedown', this.startPan.bind(this));
        container.addEventListener('mousemove', this.doPan.bind(this));
        container.addEventListener('mouseup', this.stopPan.bind(this));
        container.addEventListener('mouseleave', this.stopPan.bind(this));
        
        // Wheel zoom
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
            this.zoom(zoomFactor);
        });
    }

    startPan(e) {
        if (e.target.closest('svg')) {
            this.isDragging = true;
            this.dragStart = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
            e.preventDefault();
        }
    }

    doPan(e) {
        if (this.isDragging) {
            this.panOffset = {
                x: e.clientX - this.dragStart.x,
                y: e.clientY - this.dragStart.y
            };
            this.updateZoom();
        }
    }

    stopPan() {
        this.isDragging = false;
    }

    // Theme Management
    initializeTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Update Mermaid theme
        this.updateMermaidTheme();
    }

    updateMermaidTheme() {
        const mermaidTheme = this.currentTheme === 'dark' ? 'base' : 'default';
        const themeVariables = this.currentTheme === 'dark' ? {
            primaryColor: '#8b5cf6',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#a855f7',
            lineColor: '#c4b5fd',
            secondaryColor: '#1e293b',
            tertiaryColor: '#334155',
            background: '#000000',
            mainBkg: '#0a0a0a',
            secondBkg: '#111111',
            tertiaryBkg: '#1e293b',
            primaryBorderColor: '#c4b5fd',
            primaryTextColor: '#ffffff',
            lineColor: '#8b5cf6',
            textColor: '#ffffff',
            edgeLabelBackground: '#0a0a0a',
            nodeBorder: '#a855f7',
            clusterBkg: '#1e293b',
            clusterBorder: '#334155',
            defaultLinkColor: '#8b5cf6',
            titleColor: '#ffffff',
            fontFamily: 'Geist, sans-serif'
        } : {
            primaryColor: '#6366f1',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#4f46e5',
            lineColor: '#6366f1',
            secondaryColor: '#f8fafc',
            tertiaryColor: '#e2e8f0',
            background: '#ffffff',
            mainBkg: '#ffffff',
            secondBkg: '#f8fafc',
            tertiaryBkg: '#f1f5f9',
            primaryBorderColor: '#6366f1',
            primaryTextColor: '#0f172a',
            lineColor: '#6366f1',
            textColor: '#0f172a',
            edgeLabelBackground: '#ffffff',
            nodeBorder: '#6366f1',
            clusterBkg: '#f8fafc',
            clusterBorder: '#e2e8f0',
            defaultLinkColor: '#6366f1',
            titleColor: '#0f172a',
            fontFamily: 'Geist, sans-serif'
        };

        mermaid.initialize({
            startOnLoad: false,
            theme: mermaidTheme,
            themeVariables: themeVariables,
            securityLevel: 'loose',
            deterministicIds: false,
            logLevel: 'error',
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
                curve: 'basis',
                padding: 20
            },
            sequence: {
                useMaxWidth: false,
                wrap: true,
                showSequenceNumbers: true,
                diagramMarginX: 20,
                diagramMarginY: 20
            },
            class: {
                useMaxWidth: false
            },
            state: {
                useMaxWidth: false
            },
            er: {
                useMaxWidth: false
            },
            pie: {
                useMaxWidth: false
            },
            gantt: {
                useMaxWidth: false,
                fontSize: 14
            }
        });

        // Re-render current diagram if it exists
        if (this.currentMermaidCode) {
            setTimeout(() => {
                this.renderDiagram(this.currentMermaidCode).catch(console.warn);
            }, 100);
        }
    }

    showError(message) {
        const errorSection = document.querySelector('.error-section');
        const errorText = document.getElementById('errorText');
        
        errorText.textContent = message;
        errorSection.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            errorSection.style.display = 'none';
        }, 10000);
    }

    hideError() {
        document.querySelector('.error-section').style.display = 'none';
    }

    // Example System Descriptions
    loadExamples() {
        this.examples = {
            microservices: "Microservices e-commerce platform with API gateway, user service, product service, order service, payment gateway, Redis cache, PostgreSQL databases, and load balancer. Include authentication service, notification service, and monitoring system.",
            
            chat: "Real-time chat application with WebSocket connections, message queues (Redis), user authentication service, message persistence (MongoDB), presence tracking, push notifications, and CDN for file sharing. Include rate limiting and message encryption.",
            
            pipeline: "Data pipeline system with data ingestion layer (Kafka), stream processing workers (Apache Spark), data lake (S3), analytics engine, ETL processes, data warehouse, real-time dashboard, and monitoring alerts.",
            
            cicd: "CI/CD pipeline with Git repository, webhook triggers, build servers (Jenkins), automated testing environments, code quality gates, artifact repository, staging environment, production deployment, and rollback mechanisms."
        };
    }

    // Removed loadExample function - no longer needed

    // Main Generation Function
    async generateDiagram() {
        console.log('Generate diagram called');
        
        if (this.isGenerating) {
            console.log('Already generating, skipping');
            return;
        }

        const descriptionElement = document.getElementById('systemDescription');
        const apiKeyElement = document.getElementById('apiKey');
        
        if (!descriptionElement || !apiKeyElement) {
            console.error('Required elements not found');
            this.showError('Interface elements not found. Please refresh the page.');
            return;
        }

        const description = descriptionElement.value.trim();
        const apiKey = apiKeyElement.value.trim();

        console.log('Description:', description ? 'Present' : 'Empty');
        console.log('API Key:', apiKey ? 'Present' : 'Empty');

        // Validation
        if (!apiKey) {
            this.showError('Please enter your Google Gemini API key');
            return;
        }

        if (!description) {
            // Use default example if no description provided
            description = "Microservices e-commerce platform with API gateway, user service, product service, order service, payment gateway, Redis cache, PostgreSQL databases, and load balancer. Include authentication service, notification service, and monitoring system.";
            descriptionElement.value = description;
        }

        this.isGenerating = true;
        this.hideError();
        this.setGeneratingState(true);

        try {
            const mermaidCode = await this.generateMermaidCode(description, apiKey);
            await this.renderDiagram(mermaidCode);
        } catch (error) {
            console.error('Generation error:', error);
            this.showError(error.message || 'Failed to generate diagram. Please try again.');
        } finally {
            this.isGenerating = false;
            this.setGeneratingState(false);
        }
    }

    setGeneratingState(isGenerating) {
        const generateBtn = document.getElementById('generateBtn');
        const btnText = generateBtn.querySelector('.btn-text');
        const spinner = generateBtn.querySelector('.loading-spinner');

        if (isGenerating) {
            generateBtn.disabled = true;
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
        } else {
            generateBtn.disabled = false;
            btnText.style.display = 'inline-block';
            spinner.style.display = 'none';
        }
    }

    // Gemini API Integration
    async generateMermaidCode(description, apiKey) {
        const systemPrompt = `You are a system architecture expert. Generate ONLY valid Mermaid diagram code for the described system. 

Rules:
1. Choose the most appropriate Mermaid diagram type (flowchart, sequence, class, state, etc.)
2. Use proper Mermaid syntax and formatting
3. Focus on: components, data flow, relationships, and interactions
4. Make diagrams clear and professional
5. Use meaningful node names and labels
6. Output ONLY the Mermaid code without explanations, markdown formatting, or code blocks
7. Ensure the diagram is comprehensive but not overcomplicated

For flowcharts, use these node types:
- Rectangle nodes: [Service Name]
- Rounded nodes: (Database)
- Circle nodes: ((Cache))
- Diamond nodes: {Decision}
- Hexagon nodes: {{External API}}

System description: ${description}`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: systemPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 400) {
                throw new Error('Invalid API key or request. Please check your Gemini API key.');
            } else if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please wait a moment and try again.');
            } else {
                throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
            }
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response from Gemini API');
        }

        const generatedText = data.candidates[0].content.parts[0].text;
        
        // Clean up the response - remove markdown code blocks if present
        let mermaidCode = generatedText
            .replace(/```mermaid\n?/gi, '')
            .replace(/```\n?/g, '')
            .trim();

        // Validate basic Mermaid syntax
        if (!this.isValidMermaidCode(mermaidCode)) {
            throw new Error('Generated code is not valid Mermaid syntax');
        }

        return mermaidCode;
    }

    isValidMermaidCode(code) {
        // Basic validation for common Mermaid diagram types
        const trimmedCode = code.trim();
        
        if (!trimmedCode || trimmedCode.length < 5) {
            return false;
        }

        const mermaidPatterns = [
            /^graph\s+(TD|TB|BT|RL|LR)/i,
            /^flowchart\s+(TD|TB|BT|RL|LR)/i,
            /^sequenceDiagram/i,
            /^classDiagram/i,
            /^stateDiagram/i,
            /^erDiagram/i,
            /^pie\s+title/i,
            /^gantt/i,
            /^gitgraph/i,
            /^journey/i
        ];

        return mermaidPatterns.some(pattern => pattern.test(trimmedCode));
    }

    // Diagram Rendering
    async renderDiagram(mermaidCode) {
        this.currentMermaidCode = mermaidCode;
        
        // Update code editor
        const codeEditor = document.getElementById('mermaidCodeEditor');
        codeEditor.value = mermaidCode;

        // Render diagram
        const diagramContainer = document.getElementById('diagramContainer');
        diagramContainer.innerHTML = '<div class="diagram-loading">Rendering diagram...</div>';

        try {
            // Generate unique ID for this diagram
            const diagramId = 'diagram-' + Date.now();
            
            // Use the modern Mermaid API (v10+)
            const { svg } = await mermaid.render(diagramId, mermaidCode);
            
            if (!svg) {
                throw new Error('Failed to generate SVG from Mermaid code');
            }
            
            // Clear container and insert rendered SVG
            diagramContainer.innerHTML = svg;
            
            // Reset zoom and pan for new diagram
            this.zoomLevel = 1;
            this.panOffset = { x: 0, y: 0 };
            
            // Get the SVG element and optimize it
            const svgElement = diagramContainer.querySelector('svg');
            if (svgElement) {
                // Remove any width/height attributes to allow proper scaling
                svgElement.removeAttribute('width');
                svgElement.removeAttribute('height');
                
                // Ensure viewBox is set for proper scaling
                if (!svgElement.getAttribute('viewBox')) {
                    const bbox = svgElement.getBBox();
                    svgElement.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
                }
                
                // Style for better display
                svgElement.style.maxWidth = 'none';
                svgElement.style.height = 'auto';
                svgElement.style.display = 'block';
            }
            
            // Update zoom display
            this.updateZoom();
        } catch (error) {
            console.error('Mermaid rendering error:', error);
            diagramContainer.innerHTML = `
                <div class="diagram-error">
                    <p>❌ Failed to render diagram</p>
                    <p>The generated Mermaid code may have syntax errors.</p>
                    <p>Please check the code in the "Mermaid Code" tab.</p>
                    <details>
                        <summary>Error Details</summary>
                        <pre>${error.message}</pre>
                    </details>
                </div>
            `;
            throw new Error('Failed to render diagram: ' + error.message);
        }
    }

    // Format Mermaid code
    formatMermaidCode() {
        const codeEditor = document.getElementById('mermaidCodeEditor');
        let code = codeEditor.value;
        
        if (!code.trim()) return;
        
        // Basic formatting - add proper indentation
        const lines = code.split('\n');
        let formattedLines = [];
        let indentLevel = 0;
        
        for (let line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                formattedLines.push('');
                continue;
            }
            
            // Decrease indent for closing braces or end statements
            if (trimmedLine.includes('}') || trimmedLine.includes('end')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Add indentation
            const indent = '    '.repeat(indentLevel);
            formattedLines.push(indent + trimmedLine);
            
            // Increase indent for opening braces or class/subgraph statements
            if (trimmedLine.includes('{') || 
                trimmedLine.startsWith('subgraph') ||
                trimmedLine.startsWith('class')) {
                indentLevel++;
            }
        }
        
        const formattedCode = formattedLines.join('\n');
        codeEditor.value = formattedCode;
        this.currentMermaidCode = formattedCode;
        
        // Refresh diagram with formatted code
        this.refreshDiagram();
    }

    // Copy and Download Functions
    async copyMermaidCode() {
        const code = document.getElementById('mermaidCodeEditor').value;
        if (!code.trim()) return;

        try {
            await navigator.clipboard.writeText(code);
            
            // Visual feedback
            const copyBtn = document.getElementById('copyCodeBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            copyBtn.style.background = 'var(--success-color)';
            copyBtn.style.color = 'white';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
                copyBtn.style.color = '';
            }, 2000);
        } catch (error) {
            console.error('Copy failed:', error);
            this.showError('Failed to copy code to clipboard');
        }
    }

    async downloadDiagram(format) {
        const diagramContainer = document.getElementById('diagramContainer');
        const svgElement = diagramContainer.querySelector('svg');
        
        if (!svgElement) {
            this.showError('No diagram to download');
            return;
        }

        try {
            if (format === 'svg') {
                this.downloadSVG(svgElement);
            } else if (format === 'png') {
                await this.downloadPNG(svgElement);
            }
        } catch (error) {
            console.error('Download failed:', error);
            this.showError(`Failed to download ${format.toUpperCase()}`);
        }
    }

    downloadSVG(svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = 'system-diagram.svg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
    }

    async downloadPNG(svgElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        return new Promise((resolve, reject) => {
            img.onload = () => {
                canvas.width = img.width * 2; // Higher resolution
                canvas.height = img.height * 2;
                ctx.scale(2, 2);
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const downloadLink = document.createElement('a');
                    downloadLink.href = url;
                    downloadLink.download = 'system-diagram.png';
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(url);
                    resolve();
                }, 'image/png');
            };
            
            img.onerror = reject;
            
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            img.src = url;
        });
    }

    // Removed test functions - no longer needed

    // Clear all data
    clearAll() {
        // Clear inputs
        document.getElementById('systemDescription').value = '';
        
        // Hide error
        document.querySelector('.error-section').style.display = 'none';
        
        // Reset state
        this.currentMermaidCode = '';
        
        // Clear editor and diagram
        document.getElementById('mermaidCodeEditor').value = '';
        document.getElementById('diagramContainer').innerHTML = `
            <div class="diagram-placeholder">
                <div class="placeholder-content">
                    <span class="placeholder-icon">⚡</span>
                    <p>Generate or edit Mermaid code to see your diagram here</p>
                </div>
            </div>
        `;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SystemDesignGenerator();
});

// Service Worker Registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(() => {
            // Service worker registration failed, but app still works
        });
    });
}