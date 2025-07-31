// Admin Panel JavaScript
console.log('Admin.js loaded!');

// Simple test to see if this code executes
try {
    console.log('Admin.js execution test - this should appear');
} catch (error) {
    console.error('Error in admin.js:', error);
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
    console.error('Error details:', event.message, 'at', event.filename, 'line', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Advanced Editor Class
class AdvancedEditor {
    constructor(textareaId, options = {}) {
        this.textareaId = textareaId;
        this.textarea = document.getElementById(textareaId);
        this.options = {
            enableRichText: true,
            enableHtml: true,
            enableGoogleFonts: true,
            defaultMode: 'text', // 'text', 'rich', 'html'
            ...options
        };
        
        this.currentMode = this.options.defaultMode;
        this.originalValue = this.textarea.value;
        this.editorContainer = null;
        this.richEditor = null;
        this.htmlEditor = null;
        
        this.googleFonts = [
            { name: 'Inter', value: 'Inter', category: 'sans-serif' },
            { name: 'Roboto', value: 'Roboto', category: 'sans-serif' },
            { name: 'Open Sans', value: 'Open Sans', category: 'sans-serif' },
            { name: 'Lato', value: 'Lato', category: 'sans-serif' },
            { name: 'Poppins', value: 'Poppins', category: 'sans-serif' },
            { name: 'Playfair Display', value: 'Playfair Display', category: 'serif' },
            { name: 'Georgia', value: 'Georgia', category: 'serif' },
            { name: 'Times New Roman', value: 'Times New Roman', category: 'serif' },
            { name: 'Merriweather', value: 'Merriweather', category: 'serif' },
            { name: 'Source Code Pro', value: 'Source Code Pro', category: 'monospace' },
            { name: 'Courier New', value: 'Courier New', category: 'monospace' }
        ];
        
        this.init();
    }
    
    init() {
        if (!this.textarea) {
            console.error(`Textarea with id '${this.textareaId}' not found`);
            return;
        }
        
        this.createEditorContainer();
        this.loadGoogleFonts();
        this.setupEventListeners();
        this.switchMode(this.currentMode);
    }
    
    createEditorContainer() {
        // Hide original textarea
        this.textarea.style.display = 'none';
        
        // Create container
        this.editorContainer = document.createElement('div');
        this.editorContainer.className = 'advanced-editor-wrapper';
        this.editorContainer.setAttribute('data-textarea-id', this.textareaId);
        
        // Create toggle buttons
        this.createToggleButtons();
        
        // Create editors
        this.createRichTextEditor();
        this.createHtmlEditor();
        
        // Insert after textarea
        this.textarea.parentNode.insertBefore(this.editorContainer, this.textarea.nextSibling);
    }
    
    createToggleButtons() {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'editor-toggle-container';
        
        if (this.options.enableRichText) {
            const richBtn = document.createElement('button');
            richBtn.className = 'editor-toggle-btn';
            richBtn.innerHTML = '<i class="fas fa-bold"></i> Rich Text';
            richBtn.setAttribute('data-mode', 'rich');
            toggleContainer.appendChild(richBtn);
        }
        
        if (this.options.enableHtml) {
            const htmlBtn = document.createElement('button');
            htmlBtn.className = 'editor-toggle-btn';
            htmlBtn.innerHTML = '<i class="fas fa-code"></i> HTML';
            htmlBtn.setAttribute('data-mode', 'html');
            toggleContainer.appendChild(htmlBtn);
        }
        
        const textBtn = document.createElement('button');
        textBtn.className = 'editor-toggle-btn';
        textBtn.innerHTML = '<i class="fas fa-font"></i> Plain Text';
        textBtn.setAttribute('data-mode', 'text');
        toggleContainer.appendChild(textBtn);
        
        this.editorContainer.appendChild(toggleContainer);
    }
    
    createRichTextEditor() {
        const container = document.createElement('div');
        container.className = 'advanced-editor-container';
        container.style.display = 'none';
        
        // Create toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'advanced-editor-toolbar';
        toolbar.innerHTML = this.getRichTextToolbar();
        container.appendChild(toolbar);
        
        // Create content area
        const content = document.createElement('div');
        content.className = 'advanced-editor-content';
        content.contentEditable = true;
        content.innerHTML = this.textarea.value;
        container.appendChild(content);
        
        this.richEditor = container;
        this.editorContainer.appendChild(container);
        
        // Setup toolbar events
        this.setupRichTextToolbar(toolbar, content);
    }
    
    createHtmlEditor() {
        const container = document.createElement('div');
        container.className = 'html-editor-container';
        container.style.display = 'none';
        
        // Create toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'html-editor-toolbar';
        toolbar.innerHTML = `
            <span>HTML Editor</span>
            <button class="html-editor-btn" data-action="format">Format HTML</button>
        `;
        container.appendChild(toolbar);
        
        // Create content area
        const content = document.createElement('textarea');
        content.className = 'advanced-editor-content html-editor-content';
        content.value = this.textarea.value;
        container.appendChild(content);
        
        this.htmlEditor = container;
        this.editorContainer.appendChild(container);
        
        // Setup HTML editor events
        this.setupHtmlEditorEvents(toolbar, content);
    }
    
    getRichTextToolbar() {
        return `
            <div class="toolbar-group">
                <button class="toolbar-btn" data-command="bold" title="Bold"><i class="fas fa-bold"></i></button>
                <button class="toolbar-btn" data-command="italic" title="Italic"><i class="fas fa-italic"></i></button>
                <button class="toolbar-btn" data-command="underline" title="Underline"><i class="fas fa-underline"></i></button>
            </div>
            <div class="toolbar-group">
                <button class="toolbar-btn" data-command="insertUnorderedList" title="Bullet List"><i class="fas fa-list-ul"></i></button>
                <button class="toolbar-btn" data-command="insertOrderedList" title="Numbered List"><i class="fas fa-list-ol"></i></button>
            </div>
            <div class="toolbar-group">
                <button class="toolbar-btn" data-command="createLink" title="Insert Link"><i class="fas fa-link"></i></button>
                <button class="toolbar-btn" data-command="unlink" title="Remove Link"><i class="fas fa-unlink"></i></button>
            </div>
            <div class="toolbar-group">
                <select class="font-selector" data-command="fontName">
                    ${this.googleFonts.map(font => 
                        `<option value="${font.value}" style="font-family: '${font.value}', ${font.category}">${font.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="toolbar-group">
                <input type="color" class="color-picker" data-command="foreColor" title="Text Color">
            </div>
        `;
    }
    
    setupRichTextToolbar(toolbar, content) {
        // Formatting buttons
        toolbar.querySelectorAll('[data-command]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.getAttribute('data-command');
                
                if (command === 'createLink') {
                    const url = prompt('Enter URL:');
                    if (url) {
                        document.execCommand('createLink', false, url);
                    }
                } else if (command === 'fontName') {
                    const font = btn.value;
                    document.execCommand('fontName', false, font);
                } else if (command === 'foreColor') {
                    const color = btn.value;
                    document.execCommand('foreColor', false, color);
                } else {
                    document.execCommand(command, false, null);
                }
                
                content.focus();
            });
        });
        
        // Update toolbar state
        content.addEventListener('keyup', () => this.updateToolbarState(toolbar));
        content.addEventListener('mouseup', () => this.updateToolbarState(toolbar));
    }
    
    setupHtmlEditorEvents(toolbar, content) {
        toolbar.querySelector('[data-action="format"]').addEventListener('click', () => {
            try {
                content.value = this.formatHtml(content.value);
            } catch (error) {
                console.error('HTML formatting error:', error);
            }
        });
        
        content.addEventListener('input', () => {
            this.syncWithTextarea();
        });
    }
    
    setupEventListeners() {
        // Toggle button events
        this.editorContainer.querySelectorAll('.editor-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = btn.getAttribute('data-mode');
                this.switchMode(mode);
            });
        });
    }
    
    switchMode(mode) {
        // Hide all editors
        if (this.richEditor) this.richEditor.style.display = 'none';
        if (this.htmlEditor) this.htmlEditor.style.display = 'none';
        this.textarea.style.display = 'none';
        
        // Update toggle buttons
        this.editorContainer.querySelectorAll('.editor-toggle-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-mode') === mode) {
                btn.classList.add('active');
            }
        });
        
        // Show selected editor
        switch (mode) {
            case 'rich':
                if (this.richEditor) {
                    this.richEditor.style.display = 'block';
                    this.richEditor.querySelector('.advanced-editor-content').focus();
                }
                break;
            case 'html':
                if (this.htmlEditor) {
                    this.htmlEditor.style.display = 'block';
                    this.htmlEditor.querySelector('.html-editor-content').focus();
                }
                break;
            case 'text':
            default:
                this.textarea.style.display = 'block';
                this.textarea.focus();
                break;
        }
        
        this.currentMode = mode;
        this.syncContent();
    }
    
    syncContent() {
        const currentValue = this.getValue();
        
        // Update all editors with current value
        if (this.richEditor) {
            this.richEditor.querySelector('.advanced-editor-content').innerHTML = currentValue;
        }
        if (this.htmlEditor) {
            this.htmlEditor.querySelector('.html-editor-content').value = currentValue;
        }
        this.textarea.value = currentValue;
    }
    
    getValue() {
        switch (this.currentMode) {
            case 'rich':
                return this.richEditor ? this.richEditor.querySelector('.advanced-editor-content').innerHTML : '';
            case 'html':
                return this.htmlEditor ? this.htmlEditor.querySelector('.html-editor-content').value : '';
            case 'text':
            default:
                return this.textarea.value;
        }
    }
    
    setValue(value) {
        this.originalValue = value;
        this.syncContent();
    }
    
    syncWithTextarea() {
        const value = this.getValue();
        this.textarea.value = value;
        
        // Trigger change event for the original textarea
        const event = new Event('input', { bubbles: true });
        this.textarea.dispatchEvent(event);
        
        // Also trigger a custom event for the admin panel
        const customEvent = new CustomEvent('advancedEditorChange', {
            detail: { textareaId: this.textareaId, value: value }
        });
        this.textarea.dispatchEvent(customEvent);
    }
    
    updateToolbarState(toolbar) {
        toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
            const command = btn.getAttribute('data-command');
            if (command) {
                const isActive = document.queryCommandState(command);
                btn.classList.toggle('active', isActive);
            }
        });
    }
    
    formatHtml(html) {
        // Simple HTML formatting
        return html
            .replace(/></g, '>\n<')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    }
    
    loadGoogleFonts() {
        if (!this.options.enableGoogleFonts) return;
        
        const fontFamilies = this.googleFonts.map(font => font.value).join('|');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(link);
    }
    
    destroy() {
        if (this.editorContainer) {
            this.editorContainer.remove();
        }
        this.textarea.style.display = 'block';
    }
}
class AdminPanel {
    constructor() {
        console.log('AdminPanel constructor called');
        this.isAuthenticated = false;
        this.currentSection = 'hero';
        this.websiteData = {};
        this.contentManager = new WebsiteContentManager();
        this.supabase = null;
        this.init().catch(error => {
            console.error('Admin panel initialization failed:', error);
        });
    }

    async init() {
        this.logToDebug('Admin panel initializing...', 'info');
        
        // Wait a bit for Supabase to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (!this.initSupabase()) {
            this.logToDebug('Failed to initialize Supabase - admin panel will not work properly', 'error');
        } else {
            // Test the connection
            await this.testSupabaseConnection();
        }
        
        this.checkAuth();
        
        // Bind login events immediately
        this.bindLoginEvents();
        
        this.logToDebug('Admin panel initialization complete', 'success');
    }

    initSupabase() {
        try {
            this.logToDebug('Initializing Supabase client...', 'info');
            
            // Wait for Supabase to be available
            if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
                this.logToDebug('Supabase library not loaded! Waiting...', 'warning');
                // Try again in 1 second
                setTimeout(() => this.initSupabase(), 1000);
                return false;
            }
            
            this.supabase = window.supabase.createClient(
                'https://wwpjacyzmteiexchtnfj.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3cGphY3l6bXRlaWV4Y2h0bmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Njk2MDIsImV4cCI6MjA2NDU0NTYwMn0.cq4SuNwcmk2a7vfV9XnaXZkbv-r-LQXuWy06u75C97Q'
            );
            
            this.logToDebug('Supabase client initialized successfully', 'success');
            return true;
        } catch (error) {
            this.logToDebug(`Supabase initialization error: ${error.message}`, 'error');
            return false;
        }
    }

    // Authentication
    checkAuth() {
        // Always show login screen - no auto-login
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
    }

    showAdminPanel() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        console.log('Admin panel shown');
        
        // Bind events after admin panel is shown
        this.bindEvents();
        this.loadData();
        this.setupNavigation();
        
        // Check if save button exists after showing panel
        setTimeout(() => {
            const saveBtn = document.getElementById('save-btn');
            console.log('Save button after showing panel:', saveBtn);
        }, 500);
    }

    // Login Event Bindings
    bindLoginEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            console.log('Login form found, adding event listener');
            loginForm.addEventListener('submit', (e) => {
                console.log('Login form submitted!');
                this.handleLogin(e);
            });
        } else {
            console.error('Login form not found!');
        }
    }

    // Admin Panel Event Bindings
    bindEvents() {
        // Admin panel events only (login events are bound separately)
        
        // Preview iframe load event
        const previewIframe = document.getElementById('preview-iframe');
        if (previewIframe) {
            previewIframe.addEventListener('load', () => {
                console.log('Preview iframe loaded');
                // Update iframe with current data after load
                setTimeout(() => {
                    this.updatePreviewIframe();
                }, 100);
            });
        }
        
        // Theme preview iframe load event
        const themePreviewIframe = document.getElementById('theme-preview-iframe');
        if (themePreviewIframe) {
            themePreviewIframe.addEventListener('load', () => {
                console.log('Theme preview iframe loaded');
            });
        }

        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Buttons
        const saveBtn = document.getElementById('save-btn');
        console.log('Looking for save button...', saveBtn);
        if (saveBtn) {
            console.log('Save button found, adding event listener');
            saveBtn.addEventListener('click', () => {
                console.log('Save button clicked!');
                this.saveChanges();
            });
        } else {
            console.error('Save button not found!');
            // Try again after a delay
            setTimeout(() => {
                const retrySaveBtn = document.getElementById('save-btn');
                console.log('Retrying to find save button...', retrySaveBtn);
                if (retrySaveBtn) {
                    console.log('Save button found on retry, adding event listener');
                    retrySaveBtn.addEventListener('click', () => {
                        console.log('Save button clicked!');
                        this.saveChanges();
                    });
                }
            }, 1000);
        }

        const previewBtn = document.getElementById('preview-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Just call the working theme preview function
                this.showThemePreview();
            });
        }

        // New preview theme buttons
        const previewCurrentThemeBtn = document.getElementById('preview-current-theme');
        if (previewCurrentThemeBtn) {
            previewCurrentThemeBtn.addEventListener('click', () => this.showCurrentThemePreview());
        }

        const previewThemeLightboxBtn = document.getElementById('preview-theme-lightbox');
        if (previewThemeLightboxBtn) {
            previewThemeLightboxBtn.addEventListener('click', () => this.showThemePreviewLightbox());
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Credential change form
        const changeCredentialsForm = document.getElementById('change-credentials-form');
        if (changeCredentialsForm) {
            changeCredentialsForm.addEventListener('submit', (e) => this.changeCredentials());
        }

        // Modal close buttons
        const previewModalClose = document.querySelector('#preview-modal .modal-close');
        console.log('Looking for preview modal close button:', previewModalClose);
        if (previewModalClose) {
            console.log('Preview modal close button found, adding event listener');
            previewModalClose.addEventListener('click', () => this.closePreview());
        } else {
            console.error('Preview modal close button not found!');
        }
        
        // Screen size toggle buttons
        const screenSizeBtns = document.querySelectorAll('.screen-size-btn');
        screenSizeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = e.target.closest('.screen-size-btn').dataset.size;
                this.toggleScreenSize(size);
            });
        });
        
        const scriptModalClose = document.querySelector('#script-modal .modal-close');
        if (scriptModalClose) {
            scriptModalClose.addEventListener('click', () => this.closeScriptModal());
        }
        
        // Also handle escape key for preview modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const previewModal = document.getElementById('preview-modal');
                if (previewModal && !previewModal.classList.contains('hidden')) {
                    this.closePreview();
                }
            }
        });
        
        // Close preview modal on outside click
        const previewModal = document.getElementById('preview-modal');
        if (previewModal) {
            previewModal.addEventListener('click', (e) => {
                if (e.target === previewModal) {
                    this.closePreview();
                }
            });
        }

        // Form inputs
        this.bindFormInputs();
        
        // Form configuration
        this.bindFormConfiguration();

        // Add buttons
        const addExperienceBtn = document.getElementById('add-experience');
        if (addExperienceBtn) {
            addExperienceBtn.addEventListener('click', () => this.addExperience());
        }

        // Add skill buttons for each category
        const addSkillBtns = document.querySelectorAll('.add-skill-btn');
        console.log('Found add skill buttons:', addSkillBtns.length);
        addSkillBtns.forEach(btn => {
            console.log('Adding event listener to button:', btn);
            btn.addEventListener('click', (e) => {
                console.log('Add skill button clicked');
                const button = e.target.closest('.add-skill-btn');
                const categoryId = button.dataset.category;
                console.log('Category ID from button:', categoryId);
                this.addSkill(categoryId);
            });
        });

        const addTestimonialBtn = document.getElementById('add-testimonial');
        if (addTestimonialBtn) {
            addTestimonialBtn.addEventListener('click', () => this.addTestimonial());
        }

        const addLinkedInPostBtn = document.getElementById('add-linkedin-post');
        if (addLinkedInPostBtn) {
            addLinkedInPostBtn.addEventListener('click', () => this.addLinkedInPost());
        }

        // File upload handlers
        this.bindFileUploadHandlers();

        // Theme selection handlers
        this.bindThemeHandlers();

        // Test connection button
        const testConnectionBtn = document.getElementById('test-connection');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => this.testSupabaseConnection());
        }

        // Clear debug log button
        const clearLogBtn = document.getElementById('clear-log');
        if (clearLogBtn) {
            clearLogBtn.addEventListener('click', () => this.clearDebugLog());
        }
        
        // Color preview handlers
        this.bindColorPreviewHandlers();
        
        // Theme preview handlers
        this.bindThemePreviewHandlers();
        
        // Global font set handlers
        this.bindGlobalFontSetHandlers();
        
        // Navigation color handlers
        this.bindNavigationColorHandlers();
    }

    // Debug logging functions
    logToDebug(message, type = 'info') {
        console.log(`[DEBUG] ${message}`);
        
        const debugLog = document.getElementById('debug-log');
        if (debugLog) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${type}`;
            logEntry.textContent = `[${timestamp}] ${message}`;
            debugLog.appendChild(logEntry);
            debugLog.scrollTop = debugLog.scrollHeight;
        } else {
            console.error('Debug log element not found!');
        }
    }

    // Test Supabase connection
    async testSupabaseConnection() {
        if (!this.supabase) {
            this.logToDebug('Supabase client not initialized', 'error');
            return false;
        }

        try {
            this.logToDebug('Testing Supabase connection...', 'info');
            
            // Test admin_users table
            const { data: adminData, error: adminError } = await this.supabase
                .from('admin_users')
                .select('count')
                .limit(1);
            
            if (adminError) {
                this.logToDebug(`Admin table test failed: ${adminError.message}`, 'error');
            } else {
                this.logToDebug('Admin table accessible', 'success');
            }
            
            // Test website_content table
            const { data: contentData, error: contentError } = await this.supabase
                .from('website_content')
                .select('count')
                .limit(1);
            
            if (contentError) {
                this.logToDebug(`Website content table test failed: ${contentError.message}`, 'error');
            } else {
                this.logToDebug('Website content table accessible', 'success');
            }
            
            this.logToDebug('Supabase connection test completed', 'success');
            return true;
        } catch (error) {
            this.logToDebug(`Connection test exception: ${error.message}`, 'error');
            return false;
        }
    }

    clearDebugLog() {
        const debugLog = document.getElementById('debug-log');
        if (debugLog) {
            debugLog.innerHTML = '';
        }
    }

    // File upload handlers
    bindFileUploadHandlers() {
        // Hero image upload
        const heroImageUpload = document.getElementById('hero-image-upload');
        if (heroImageUpload) {
            heroImageUpload.addEventListener('change', (e) => this.handleImageUpload(e, 'hero'));
        }

        // Bind file upload handlers for testimonials (will be called when testimonials are created)
        this.bindTestimonialFileUploads();
    }

    bindTestimonialFileUploads() {
        const testimonialUploads = document.querySelectorAll('.testimonial-image-upload');
        testimonialUploads.forEach(upload => {
            upload.addEventListener('change', (e) => this.handleImageUpload(e, 'testimonial'));
        });
    }

    async handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showMessage('File size must be less than 5MB', 'error');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showMessage('Please select an image file', 'error');
            return;
        }

        try {
            // Convert file to base64
            const base64 = await this.fileToBase64(file);
            
            if (type === 'hero') {
                // Update hero image
                document.getElementById('hero-image').value = base64;
                const previewImg = document.getElementById('hero-preview-img');
                if (previewImg) {
                    previewImg.src = base64;
                    previewImg.style.display = 'block';
                }
            } else if (type === 'testimonial') {
                // Update testimonial image
                const index = event.target.getAttribute('data-index');
                const testimonialImageInput = document.querySelector(`.testimonial-image[data-index="${index}"]`);
                if (testimonialImageInput) {
                    testimonialImageInput.value = base64;
                }
                
                // Update preview
                const previewImg = event.target.closest('.image-upload-container').querySelector('.testimonial-preview-img');
                if (previewImg) {
                    previewImg.src = base64;
                    previewImg.style.display = 'block';
                }
            }

            this.showMessage('Image uploaded successfully!', 'success');
        } catch (error) {
            console.error('Error uploading image:', error);
            this.showMessage('Error uploading image', 'error');
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Theme handlers
    bindThemeHandlers() {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const selectedTheme = option.getAttribute('data-theme');
                this.selectTheme(selectedTheme);
            });
        });
    }

    selectTheme(themeName) {
        // Remove selected class from all options
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add selected class to clicked option
        const selectedOption = document.querySelector(`[data-theme="${themeName}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        // Store theme selection
        if (!this.websiteData.settings) this.websiteData.settings = {};
        this.websiteData.settings.theme = themeName;

        // Update preview iframe with new theme
        this.updateThemeInPreview(themeName);

        this.showMessage(`Theme "${themeName}" selected!`, 'success');
    }

    updateThemeInPreview(themeName) {
        const iframe = document.getElementById('preview-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'CHANGE_THEME',
                theme: themeName
            }, '*');
        }
    }

    // Login Handler
    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        this.logToDebug(`Login attempt for username: ${username}`, 'info');

        // Check if Supabase is available
        if (!this.supabase) {
            this.logToDebug('Supabase client not available, trying to initialize...', 'error');
            if (!this.initSupabase()) {
                this.logToDebug('Failed to initialize Supabase', 'error');
                this.showMessage('Database connection not available. Please refresh the page.', 'error');
                return;
            }
        }

        try {
            this.logToDebug('Connecting to Supabase...', 'info');
            
            // Get admin user from Supabase
            const { data, error } = await this.supabase
                .from('admin_users')
                .select('*')
                .eq('username', username)
                .single();

            this.logToDebug(`Supabase query completed. Error: ${error ? error.message : 'None'}`, 'info');
            this.logToDebug(`Data received: ${data ? 'Yes' : 'No'}`, 'info');

            if (error) {
                this.logToDebug(`Database error: ${error.message}`, 'error');
                this.showMessage('Invalid credentials!', 'error');
                return;
            }

            if (!data) {
                this.logToDebug('No user found with this username', 'error');
                this.showMessage('Invalid credentials!', 'error');
                return;
            }

            this.logToDebug(`User found. Checking password...`, 'info');
            this.logToDebug(`Stored password hash: ${data.password_hash}`, 'info');
            this.logToDebug(`Entered password: ${password}`, 'info');

            // Simple password check (in production, use proper hashing)
            if (data.password_hash === password) {
                this.logToDebug('Password match! Login successful', 'success');
                localStorage.setItem('admin_token', 'authenticated');
                localStorage.setItem('admin_username', username);
                this.isAuthenticated = true;
                this.showAdminPanel();
                this.showMessage('Login successful!', 'success');
            } else {
                this.logToDebug('Password mismatch! Login failed', 'error');
                this.showMessage('Invalid credentials!', 'error');
            }
        } catch (error) {
            this.logToDebug(`Login exception: ${error.message}`, 'error');
            console.error('Login error:', error);
            this.showMessage('Login failed!', 'error');
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        this.isAuthenticated = false;
        this.showLoginScreen();
        this.showMessage('Logged out successfully!', 'success');
    }

    // Change Credentials
    async changeCredentials() {
        const currentUsername = localStorage.getItem('admin_username');
        const newUsername = document.getElementById('new-username').value;
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!newUsername || !currentPassword || !newPassword || !confirmPassword) {
            this.showMessage('All fields are required!', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showMessage('New passwords do not match!', 'error');
            return;
        }

        try {
            // Verify current credentials
            const { data: currentUser, error: verifyError } = await this.supabase
                .from('admin_users')
                .select('*')
                .eq('username', currentUsername)
                .single();

            if (verifyError || !currentUser || currentUser.password_hash !== currentPassword) {
                this.showMessage('Current password is incorrect!', 'error');
                return;
            }

            // Update credentials
            const { error: updateError } = await this.supabase
                .from('admin_users')
                .update({
                    username: newUsername,
                    password_hash: newPassword
                })
                .eq('username', currentUsername);

            if (updateError) {
                this.showMessage('Error updating credentials!', 'error');
                return;
            }

            // Update local storage
            localStorage.setItem('admin_username', newUsername);
            
            // Clear form
            document.getElementById('new-username').value = '';
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';

            this.showMessage('Credentials updated successfully!', 'success');
        } catch (error) {
            console.error('Error changing credentials:', error);
            this.showMessage('Error updating credentials!', 'error');
        }
    }

    // Navigation
    handleNavigation(e) {
        e.preventDefault();
        const section = e.currentTarget.dataset.section;
        this.switchSection(section);
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update editor sections
        document.querySelectorAll('.editor-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
        });
        document.getElementById(`${section}-editor`).classList.add('active');

        this.currentSection = section;
    }

    // Form Input Binding
    bindFormInputs() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.updatePreview(e.target);
            });
        });
        
        // Listen for advanced editor changes
        document.addEventListener('advancedEditorChange', (e) => {
            this.updatePreview(e.detail.textareaId);
        });
        
        // Initialize advanced editors for textareas
        this.initializeAdvancedEditors();
    }
    
    initializeAdvancedEditors() {
        // List of textarea IDs that should have advanced editors
        const advancedEditorTextareas = [
            'hero-description',
            'about-description', 
            'about-text',
            'typewriter-titles',
            'autoresponder-code'
        ];
        
        // Initialize advanced editors
        this.advancedEditors = {};
        advancedEditorTextareas.forEach(textareaId => {
            const textarea = document.getElementById(textareaId);
            if (textarea) {
                try {
                    this.advancedEditors[textareaId] = new AdvancedEditor(textareaId, {
                        enableRichText: true,
                        enableHtml: true,
                        enableGoogleFonts: true,
                        defaultMode: 'text'
                    });
                    
                    // Add event listener for content changes
                    textarea.addEventListener('input', (e) => {
                        this.updatePreview(e.target);
                    });
                } catch (error) {
                    console.error(`Failed to initialize advanced editor for ${textareaId}:`, error);
                }
            }
        });
        
        // Initialize button and navbar editors
        this.initializeButtonEditors();
        this.initializeNavbarEditors();
        this.initializeNavigationAdmin();
        this.initializeScriptManager();
        this.initializeDarkMode();
    }
    
    initializeButtonEditors() {
        // Bind button editor events
        const buttonInputs = [
            'hero-btn-primary-text', 'hero-btn-primary-link', 'hero-btn-primary-link-type',
            'hero-btn-primary-bg-start', 'hero-btn-primary-bg-end', 'hero-btn-primary-text-color',
            'hero-btn-primary-border', 'hero-btn-primary-border-width', 'hero-btn-primary-radius',
            'hero-btn-primary-padding', 'hero-btn-primary-font-size', 'hero-btn-primary-new-tab',
            'hero-btn-secondary-text', 'hero-btn-secondary-link', 'hero-btn-secondary-link-type',
            'hero-btn-secondary-bg', 'hero-btn-secondary-text-color', 'hero-btn-secondary-border',
            'hero-btn-secondary-border-width', 'hero-btn-secondary-radius', 'hero-btn-secondary-padding',
            'hero-btn-secondary-font-size', 'hero-btn-secondary-new-tab'
        ];
        
        buttonInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.updatePreview());
                input.addEventListener('change', () => this.updatePreview());
            }
        });
    }
    
    initializeNavbarEditors() {
        // Bind navbar editor events
        const navbarInputs = [
            'navbar-style', 'navbar-sticky', 'navbar-bg-color', 'navbar-bg-opacity',
            'navbar-text-color', 'navbar-hover-color', 'navbar-font-size', 'navbar-padding'
        ];
        
        navbarInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.updatePreview());
                input.addEventListener('change', () => this.updatePreview());
            }
        });
        
        // Handle opacity range input
        const opacityRange = document.getElementById('navbar-bg-opacity');
        const opacityValue = document.getElementById('navbar-opacity-value');
        if (opacityRange && opacityValue) {
            opacityRange.addEventListener('input', (e) => {
                opacityValue.textContent = e.target.value + '%';
                this.updatePreview();
            });
        }
        
        // Initialize navigation links
        this.initializeNavigationLinks();
    }
    
    initializeNavigationLinks() {
        // Add navigation link button
        const addNavLinkBtn = document.getElementById('add-nav-link');
        if (addNavLinkBtn) {
            addNavLinkBtn.addEventListener('click', () => this.addNavigationLink());
        }
        
        // Load existing navigation links
        this.loadNavigationLinks();
    }
    
    addNavigationLink() {
        const navLinksList = document.getElementById('nav-links-list');
        if (!navLinksList) return;
        
        const linkIndex = navLinksList.children.length;
        const linkItem = document.createElement('div');
        linkItem.className = 'nav-link-item';
        linkItem.innerHTML = `
            <button type="button" class="remove-nav-link" onclick="adminPanel.removeNavigationLink(${linkIndex})">
                <i class="fas fa-trash"></i>
            </button>
            <h5>Navigation Link ${linkIndex + 1}</h5>
            <div class="form-row">
                <div class="form-group">
                    <label>Link Text</label>
                    <input type="text" class="nav-link-text" value="New Link" data-index="${linkIndex}">
                </div>
                <div class="form-group">
                    <label>Link Type</label>
                    <select class="nav-link-type" data-index="${linkIndex}">
                        <option value="anchor">Page Anchor</option>
                        <option value="external">External URL</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Link Target</label>
                    <input type="text" class="nav-link-target" value="#section" placeholder="#section or https://example.com" data-index="${linkIndex}">
                </div>
                <div class="form-group">
                    <label>Open in New Tab</label>
                    <input type="checkbox" class="nav-link-new-tab" data-index="${linkIndex}">
                </div>
            </div>
        `;
        
        navLinksList.appendChild(linkItem);
        
        // Add event listeners
        linkItem.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });
    }
    
    removeNavigationLink(index) {
        const navLinksList = document.getElementById('nav-links-list');
        if (navLinksList && navLinksList.children[index]) {
            navLinksList.children[index].remove();
            this.updatePreview();
        }
    }
    
    loadNavigationLinks() {
        // Default navigation links
        const defaultLinks = [
            { text: 'Home', target: '#home', type: 'anchor', newTab: false },
            { text: 'About', target: '#about', type: 'anchor', newTab: false },
            { text: 'Experience', target: '#experience', type: 'anchor', newTab: false },
            { text: 'Skills', target: '#skills', type: 'anchor', newTab: false },
            { text: 'LinkedIn', target: '#linkedin', type: 'anchor', newTab: false },
            { text: 'Testimonials', target: '#testimonials', type: 'anchor', newTab: false },
            { text: 'Contact', target: '#contact', type: 'anchor', newTab: false }
        ];
        
        const navLinksList = document.getElementById('nav-links-list');
        if (!navLinksList) return;
        
        navLinksList.innerHTML = '';
        defaultLinks.forEach((link, index) => {
            const linkItem = document.createElement('div');
            linkItem.className = 'nav-link-item';
            linkItem.innerHTML = `
                <button type="button" class="remove-nav-link" onclick="adminPanel.removeNavigationLink(${index})">
                    <i class="fas fa-trash"></i>
                </button>
                <h5>Navigation Link ${index + 1}</h5>
                <div class="form-row">
                    <div class="form-group">
                        <label>Link Text</label>
                        <input type="text" class="nav-link-text" value="${link.text}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Link Type</label>
                        <select class="nav-link-type" data-index="${index}">
                            <option value="anchor" ${link.type === 'anchor' ? 'selected' : ''}>Page Anchor</option>
                            <option value="external" ${link.type === 'external' ? 'selected' : ''}>External URL</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Link Target</label>
                        <input type="text" class="nav-link-target" value="${link.target}" placeholder="#section or https://example.com" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Open in New Tab</label>
                        <input type="checkbox" class="nav-link-new-tab" data-index="${index}" ${link.newTab ? 'checked' : ''}>
                    </div>
                </div>
            `;
            
            navLinksList.appendChild(linkItem);
            
            // Add event listeners
            linkItem.querySelectorAll('input, select').forEach(input => {
                input.addEventListener('input', () => this.updatePreview());
                input.addEventListener('change', () => this.updatePreview());
            });
        });
    }
    
    initializeNavigationAdmin() {
        // Bind navigation admin events
        const navInputs = [
            'nav-bg-color', 'nav-bg-opacity', 'nav-text-color', 'nav-hover-color',
            'nav-font-size', 'nav-padding', 'nav-sticky', 'nav-show-logo'
        ];
        
        navInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.updatePreview());
                input.addEventListener('change', () => this.updatePreview());
            }
        });
        
        // Handle opacity range input
        const opacityRange = document.getElementById('nav-bg-opacity');
        const opacityValue = document.getElementById('nav-opacity-value');
        if (opacityRange && opacityValue) {
            opacityRange.addEventListener('input', (e) => {
                opacityValue.textContent = e.target.value + '%';
                this.updatePreview();
            });
        }
        
        // Initialize logo functionality
        this.initializeLogoHandlers();
        
        // Initialize legal compliance functionality
        this.initializeLegalCompliance();
        
        // Initialize navigation links admin
        this.initializeNavigationLinksAdmin();
    }
    
    initializeLogoHandlers() {
        // Show/hide logo config based on show logo checkbox
        const showLogoCheckbox = document.getElementById('nav-show-logo');
        const logoConfig = document.getElementById('logo-config');
        
        if (showLogoCheckbox && logoConfig) {
            showLogoCheckbox.addEventListener('change', (e) => {
                logoConfig.style.display = e.target.checked ? 'block' : 'none';
                this.updatePreview();
            });
            
            // Set initial state
            logoConfig.style.display = showLogoCheckbox.checked ? 'block' : 'none';
        }
        
        // Logo type selection
        const logoType = document.getElementById('logo-type');
        const singleLogoSection = document.getElementById('single-logo-section');
        const dualLogoSection = document.getElementById('dual-logo-section');
        
        if (logoType && singleLogoSection && dualLogoSection) {
            logoType.addEventListener('change', (e) => {
                if (e.target.value === 'single') {
                    singleLogoSection.style.display = 'block';
                    dualLogoSection.style.display = 'none';
                } else {
                    singleLogoSection.style.display = 'none';
                    dualLogoSection.style.display = 'block';
                }
            });
        }
        
        // Logo upload handlers
        this.bindLogoUploadHandlers();
        
        // Logo size handler
        const logoSize = document.getElementById('logo-size');
        const logoSizeValue = document.getElementById('logo-size-value');
        
        if (logoSize && logoSizeValue) {
            logoSize.addEventListener('input', (e) => {
                logoSizeValue.textContent = e.target.value + 'px';
                this.updatePreview();
            });
        }
    }
    
    bindLogoUploadHandlers() {
        // Single logo upload
        const logoUpload = document.getElementById('logo-upload');
        if (logoUpload) {
            logoUpload.addEventListener('change', (e) => {
                this.handleLogoUpload(e, 'single');
            });
        }
        
        // Dark logo upload
        const logoDarkUpload = document.getElementById('logo-dark-upload');
        if (logoDarkUpload) {
            logoDarkUpload.addEventListener('change', (e) => {
                this.handleLogoUpload(e, 'dark');
            });
        }
        
        // Light logo upload
        const logoLightUpload = document.getElementById('logo-light-upload');
        if (logoLightUpload) {
            logoLightUpload.addEventListener('change', (e) => {
                this.handleLogoUpload(e, 'light');
            });
        }
    }
    
    handleLogoUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const logoData = e.target.result;
            
            if (type === 'single') {
                this.updateLogoPreview('logo-preview', 'logo-preview-img', logoData);
                if (!this.websiteData.navigation) this.websiteData.navigation = {};
                this.websiteData.navigation.logo = logoData;
            } else if (type === 'dark') {
                this.updateLogoPreview('logo-dark-preview', 'logo-dark-preview-img', logoData);
                if (!this.websiteData.navigation) this.websiteData.navigation = {};
                this.websiteData.navigation.logoDark = logoData;
            } else if (type === 'light') {
                this.updateLogoPreview('logo-light-preview', 'logo-light-preview-img', logoData);
                if (!this.websiteData.navigation) this.websiteData.navigation = {};
                this.websiteData.navigation.logoLight = logoData;
            }
            
            this.updatePreview();
        };
        reader.readAsDataURL(file);
    }
    
    updateLogoPreview(containerId, imgId, logoData) {
        const container = document.getElementById(containerId);
        const img = document.getElementById(imgId);
        
        if (container && img) {
            img.src = logoData;
            container.style.display = 'block';
        }
    }
    
    removeLogo(type = 'single') {
        if (type === 'single') {
            document.getElementById('logo-preview').style.display = 'none';
            document.getElementById('logo-upload').value = '';
            if (this.websiteData.navigation) {
                delete this.websiteData.navigation.logo;
            }
        } else if (type === 'dark') {
            document.getElementById('logo-dark-preview').style.display = 'none';
            document.getElementById('logo-dark-upload').value = '';
            if (this.websiteData.navigation) {
                delete this.websiteData.navigation.logoDark;
            }
        } else if (type === 'light') {
            document.getElementById('logo-light-preview').style.display = 'none';
            document.getElementById('logo-light-upload').value = '';
            if (this.websiteData.navigation) {
                delete this.websiteData.navigation.logoLight;
            }
        }
        
        this.updatePreview();
    }
    
    initializeLegalCompliance() {
        // Bind legal compliance events
        const generateLegalBtn = document.getElementById('generate-legal-pages');
        if (generateLegalBtn) {
            generateLegalBtn.addEventListener('click', () => {
                this.generateLegalPages();
            });
        }
        
        // Load existing legal data
        this.loadLegalData();
    }
    
    loadLegalData() {
        if (!this.websiteData.legal) return;
        
        const legal = this.websiteData.legal;
        
        // Populate company information
        document.getElementById('company-name').value = legal.companyName || '';
        document.getElementById('entity-type').value = legal.entityType || 'individual';
        document.getElementById('country-operation').value = legal.countryOperation || 'australia';
        document.getElementById('business-address').value = legal.businessAddress || '';
        document.getElementById('legal-email').value = legal.legalEmail || '';
        document.getElementById('legal-phone').value = legal.legalPhone || '';
        
        // Populate data collection settings
        document.getElementById('collect-name').checked = legal.collectName !== false;
        document.getElementById('collect-email').checked = legal.collectEmail !== false;
        document.getElementById('collect-phone').checked = legal.collectPhone || false;
        document.getElementById('collect-address').checked = legal.collectAddress || false;
        document.getElementById('collect-cookies').checked = legal.collectCookies !== false;
        document.getElementById('collect-usage').checked = legal.collectUsage || false;
        
        // Populate data usage purposes
        document.getElementById('purpose-contact').checked = legal.purposeContact !== false;
        document.getElementById('purpose-services').checked = legal.purposeServices !== false;
        document.getElementById('purpose-marketing').checked = legal.purposeMarketing || false;
        document.getElementById('purpose-analytics').checked = legal.purposeAnalytics !== false;
        document.getElementById('purpose-legal').checked = legal.purposeLegal || false;
        
        // Populate third party services
        document.getElementById('google-analytics').checked = legal.googleAnalytics || false;
        document.getElementById('facebook-pixel').checked = legal.facebookPixel || false;
        document.getElementById('hotjar').checked = legal.hotjar || false;
        document.getElementById('stripe').checked = legal.stripe || false;
        document.getElementById('paypal').checked = legal.paypal || false;
        document.getElementById('square').checked = legal.square || false;
        document.getElementById('mailchimp').checked = legal.mailchimp || false;
        document.getElementById('hubspot').checked = legal.hubspot || false;
        document.getElementById('zapier').checked = legal.zapier || false;
        
        // Populate legal pages to generate
        document.getElementById('generate-privacy').checked = legal.generatePrivacy !== false;
        document.getElementById('generate-terms').checked = legal.generateTerms !== false;
        document.getElementById('generate-disclaimer').checked = legal.generateDisclaimer !== false;
        document.getElementById('generate-cookies').checked = legal.generateCookies !== false;
        document.getElementById('generate-ccpa').checked = legal.generateCCPA || false;
        document.getElementById('generate-gdpr').checked = legal.generateGDPR || false;
        
        // Populate cookie consent settings
        document.getElementById('enable-cookie-consent').checked = legal.enableCookieConsent !== false;
        document.getElementById('cookie-message').value = legal.cookieMessage || 'We use cookies to enhance your experience, analyze site traffic, and personalize content. By continuing to use this site, you consent to our use of cookies.';
        document.getElementById('accept-button-text').value = legal.acceptButtonText || 'Accept All';
        document.getElementById('decline-button-text').value = legal.declineButtonText || 'Decline';
        
        // Populate data retention
        document.getElementById('data-retention').value = legal.dataRetention || 24;
    }
    
    generateLegalPages() {
        // Collect all legal data
        const legalData = this.collectLegalData();
        
        // Generate legal pages based on settings
        const generatedPages = [];
        
        if (legalData.generatePrivacy) {
            generatedPages.push({
                name: 'Privacy Policy',
                url: '/privacy-policy',
                status: 'generated',
                content: this.generatePrivacyPolicy(legalData)
            });
        }
        
        if (legalData.generateTerms) {
            generatedPages.push({
                name: 'Terms of Service',
                url: '/terms-of-service',
                status: 'generated',
                content: this.generateTermsOfService(legalData)
            });
        }
        
        if (legalData.generateDisclaimer) {
            generatedPages.push({
                name: 'Disclaimer',
                url: '/disclaimer',
                status: 'generated',
                content: this.generateDisclaimer(legalData)
            });
        }
        
        if (legalData.generateCookies) {
            generatedPages.push({
                name: 'Cookie Policy',
                url: '/cookie-policy',
                status: 'generated',
                content: this.generateCookiePolicy(legalData)
            });
        }
        
        if (legalData.generateCCPA) {
            generatedPages.push({
                name: 'CCPA Notice',
                url: '/ccpa-notice',
                status: 'generated',
                content: this.generateCCPANotice(legalData)
            });
        }
        
        if (legalData.generateGDPR) {
            generatedPages.push({
                name: 'GDPR Notice',
                url: '/gdpr-notice',
                status: 'generated',
                content: this.generateGDPRNotice(legalData)
            });
        }
        
        // Save legal data
        if (!this.websiteData.legal) this.websiteData.legal = {};
        this.websiteData.legal = { ...this.websiteData.legal, ...legalData, generatedPages };
        
        // Update preview
        this.updateLegalPagesPreview(generatedPages);
        
        // Show success message
        this.showMessage('Legal pages generated successfully!', 'success');
    }
    
    collectLegalData() {
        return {
            companyName: document.getElementById('company-name').value,
            entityType: document.getElementById('entity-type').value,
            countryOperation: document.getElementById('country-operation').value,
            businessAddress: document.getElementById('business-address').value,
            legalEmail: document.getElementById('legal-email').value,
            legalPhone: document.getElementById('legal-phone').value,
            
            // Data collection
            collectName: document.getElementById('collect-name').checked,
            collectEmail: document.getElementById('collect-email').checked,
            collectPhone: document.getElementById('collect-phone').checked,
            collectAddress: document.getElementById('collect-address').checked,
            collectCookies: document.getElementById('collect-cookies').checked,
            collectUsage: document.getElementById('collect-usage').checked,
            
            // Data usage purposes
            purposeContact: document.getElementById('purpose-contact').checked,
            purposeServices: document.getElementById('purpose-services').checked,
            purposeMarketing: document.getElementById('purpose-marketing').checked,
            purposeAnalytics: document.getElementById('purpose-analytics').checked,
            purposeLegal: document.getElementById('purpose-legal').checked,
            
            // Third party services
            googleAnalytics: document.getElementById('google-analytics').checked,
            facebookPixel: document.getElementById('facebook-pixel').checked,
            hotjar: document.getElementById('hotjar').checked,
            stripe: document.getElementById('stripe').checked,
            paypal: document.getElementById('paypal').checked,
            square: document.getElementById('square').checked,
            mailchimp: document.getElementById('mailchimp').checked,
            hubspot: document.getElementById('hubspot').checked,
            zapier: document.getElementById('zapier').checked,
            
            // Legal pages to generate
            generatePrivacy: document.getElementById('generate-privacy').checked,
            generateTerms: document.getElementById('generate-terms').checked,
            generateDisclaimer: document.getElementById('generate-disclaimer').checked,
            generateCookies: document.getElementById('generate-cookies').checked,
            generateCCPA: document.getElementById('generate-ccpa').checked,
            generateGDPR: document.getElementById('generate-gdpr').checked,
            
            // Cookie consent
            enableCookieConsent: document.getElementById('enable-cookie-consent').checked,
            cookieMessage: document.getElementById('cookie-message').value,
            acceptButtonText: document.getElementById('accept-button-text').value,
            declineButtonText: document.getElementById('decline-button-text').value,
            
            // Data retention
            dataRetention: parseInt(document.getElementById('data-retention').value)
        };
    }
    
    updateLegalPagesPreview(pages) {
        const previewContainer = document.querySelector('.legal-pages-list');
        if (!previewContainer) return;
        
        previewContainer.innerHTML = '';
        
        pages.forEach(page => {
            const pageItem = document.createElement('div');
            pageItem.className = 'legal-page-item';
            pageItem.innerHTML = `
                <span class="page-name">${page.name}</span>
                <span class="page-status ${page.status === 'generated' ? 'status-generated' : 'status-pending'}">${page.status}</span>
            `;
            previewContainer.appendChild(pageItem);
        });
    }
    
    generatePrivacyPolicy(data) {
        return `
            <h1>Privacy Policy</h1>
            <p>Last updated: ${new Date().toLocaleDateString()}</p>
            
            <h2>1. Information We Collect</h2>
            <p>${data.companyName} ("we," "our," or "us") collects information you provide directly to us, including:</p>
            <ul>
                ${data.collectName ? '<li>Name and contact information</li>' : ''}
                ${data.collectEmail ? '<li>Email address</li>' : ''}
                ${data.collectPhone ? '<li>Phone number</li>' : ''}
                ${data.collectAddress ? '<li>Address information</li>' : ''}
                ${data.collectCookies ? '<li>Cookies and usage data</li>' : ''}
                ${data.collectUsage ? '<li>Website usage information</li>' : ''}
            </ul>
            
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
                ${data.purposeContact ? '<li>Communicate with you</li>' : ''}
                ${data.purposeServices ? '<li>Provide our services</li>' : ''}
                ${data.purposeMarketing ? '<li>Send marketing communications</li>' : ''}
                ${data.purposeAnalytics ? '<li>Analyze and improve our website</li>' : ''}
                ${data.purposeLegal ? '<li>Comply with legal obligations</li>' : ''}
            </ul>
            
            <h2>3. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
            
            <h2>4. Data Retention</h2>
            <p>We retain your personal information for ${data.dataRetention} months or as long as necessary to fulfill the purposes outlined in this policy.</p>
            
            <h2>5. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <p>Email: ${data.legalEmail}<br>
            Phone: ${data.legalPhone}<br>
            Address: ${data.businessAddress}</p>
        `;
    }
    
    generateTermsOfService(data) {
        return `
            <h1>Terms of Service</h1>
            <p>Last updated: ${new Date().toLocaleDateString()}</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h2>2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials on ${data.companyName}'s website for personal, non-commercial transitory viewing only.</p>
            
            <h2>3. Disclaimer</h2>
            <p>The materials on ${data.companyName}'s website are provided on an 'as is' basis. ${data.companyName} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            
            <h2>4. Limitations</h2>
            <p>In no event shall ${data.companyName} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ${data.companyName}'s website.</p>
            
            <h2>5. Contact Information</h2>
            <p>For questions about these Terms of Service, please contact us at:</p>
            <p>Email: ${data.legalEmail}<br>
            Phone: ${data.legalPhone}<br>
            Address: ${data.businessAddress}</p>
        `;
    }
    
    generateDisclaimer(data) {
        return `
            <h1>Disclaimer</h1>
            <p>Last updated: ${new Date().toLocaleDateString()}</p>
            
            <h2>1. Information Accuracy</h2>
            <p>The information provided on this website is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the website for any purpose.</p>
            
            <h2>2. Professional Advice</h2>
            <p>Any reliance you place on such information is therefore strictly at your own risk. In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, arising from loss of data or profits arising out of, or in connection with, the use of this website.</p>
            
            <h2>3. External Links</h2>
            <p>Through this website, you are able to link to other websites which are not under the control of ${data.companyName}. We have no control over the nature, content, and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.</p>
            
            <h2>4. Contact Information</h2>
            <p>For questions about this Disclaimer, please contact us at:</p>
            <p>Email: ${data.legalEmail}<br>
            Phone: ${data.legalPhone}<br>
            Address: ${data.businessAddress}</p>
        `;
    }
    
    generateCookiePolicy(data) {
        return `
            <h1>Cookie Policy</h1>
            <p>Last updated: ${new Date().toLocaleDateString()}</p>
            
            <h2>1. What Are Cookies</h2>
            <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.</p>
            
            <h2>2. How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul>
                <li>To provide you with a better experience on our website</li>
                <li>To analyze how our website is used</li>
                <li>To personalize content and advertisements</li>
            </ul>
            
            <h2>3. Types of Cookies We Use</h2>
            <ul>
                <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly</li>
                <li><strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website</li>
                <li><strong>Marketing Cookies:</strong> These cookies are used to track visitors across websites to display relevant advertisements</li>
            </ul>
            
            <h2>4. Managing Cookies</h2>
            <p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.</p>
            
            <h2>5. Contact Information</h2>
            <p>For questions about our Cookie Policy, please contact us at:</p>
            <p>Email: ${data.legalEmail}<br>
            Phone: ${data.legalPhone}<br>
            Address: ${data.businessAddress}</p>
        `;
    }
    
    generateCCPANotice(data) {
        return `
            <h1>California Consumer Privacy Act (CCPA) Notice</h1>
            <p>Last updated: ${new Date().toLocaleDateString()}</p>
            
            <h2>1. Your Rights Under CCPA</h2>
            <p>Under the California Consumer Privacy Act (CCPA), California residents have the following rights:</p>
            <ul>
                <li>The right to know what personal information is collected, used, shared, or sold</li>
                <li>The right to delete personal information held by us</li>
                <li>The right to opt-out of the sale of personal information</li>
                <li>The right to non-discrimination for exercising your CCPA rights</li>
            </ul>
            
            <h2>2. Information We Collect</h2>
            <p>We collect the following categories of personal information:</p>
            <ul>
                ${data.collectName ? '<li>Identifiers (name, email address)</li>' : ''}
                ${data.collectPhone ? '<li>Contact information (phone number)</li>' : ''}
                ${data.collectAddress ? '<li>Geographic data (address)</li>' : ''}
                ${data.collectUsage ? '<li>Internet activity (browsing history)</li>' : ''}
            </ul>
            
            <h2>3. How to Exercise Your Rights</h2>
            <p>To exercise your CCPA rights, please contact us at:</p>
            <p>Email: ${data.legalEmail}<br>
            Phone: ${data.legalPhone}<br>
            Address: ${data.businessAddress}</p>
        `;
    }
    
    generateGDPRNotice(data) {
        return `
            <h1>General Data Protection Regulation (GDPR) Notice</h1>
            <p>Last updated: ${new Date().toLocaleDateString()}</p>
            
            <h2>1. Your Rights Under GDPR</h2>
            <p>Under the GDPR, you have the following rights:</p>
            <ul>
                <li>The right to be informed about the collection and use of your personal data</li>
                <li>The right of access to your personal data</li>
                <li>The right to rectification of inaccurate personal data</li>
                <li>The right to erasure of your personal data</li>
                <li>The right to restrict processing of your personal data</li>
                <li>The right to data portability</li>
                <li>The right to object to processing of your personal data</li>
                <li>Rights in relation to automated decision making and profiling</li>
            </ul>
            
            <h2>2. Legal Basis for Processing</h2>
            <p>We process your personal data based on the following legal grounds:</p>
            <ul>
                <li>Consent: When you have given us clear consent to process your personal data</li>
                <li>Contract: When processing is necessary for a contract we have with you</li>
                <li>Legitimate interests: When processing is necessary for our legitimate interests</li>
                <li>Legal obligation: When processing is necessary to comply with the law</li>
            </ul>
            
            <h2>3. Data Retention</h2>
            <p>We retain your personal data for ${data.dataRetention} months or as long as necessary to fulfill the purposes for which it was collected.</p>
            
            <h2>4. Contact Information</h2>
            <p>For questions about your GDPR rights, please contact us at:</p>
            <p>Email: ${data.legalEmail}<br>
            Phone: ${data.legalPhone}<br>
            Address: ${data.businessAddress}</p>
        `;
    }
    
    initializeNavigationLinksAdmin() {
        // Add navigation link button
        const addNavLinkBtn = document.getElementById('add-nav-link-admin');
        if (addNavLinkBtn) {
            addNavLinkBtn.addEventListener('click', () => this.addNavigationLinkAdmin());
        }
        
        // Load existing navigation links
        this.loadNavigationLinksAdmin();
    }
    
    addNavigationLinkAdmin() {
        const navLinksList = document.getElementById('nav-links-admin-list');
        if (!navLinksList) return;
        
        const linkIndex = navLinksList.children.length;
        const linkItem = document.createElement('div');
        linkItem.className = 'nav-link-item';
        linkItem.innerHTML = `
            <button type="button" class="remove-nav-link" onclick="adminPanel.removeNavigationLinkAdmin(${linkIndex})">
                <i class="fas fa-trash"></i>
            </button>
            <h5>Navigation Link ${linkIndex + 1}</h5>
            <div class="form-row">
                <div class="form-group">
                    <label>Link Text</label>
                    <input type="text" class="nav-link-text-admin" value="New Link" data-index="${linkIndex}">
                </div>
                <div class="form-group">
                    <label>Link Type</label>
                    <select class="nav-link-type-admin" data-index="${linkIndex}">
                        <option value="anchor">Page Anchor</option>
                        <option value="external">External URL</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Link Target</label>
                    <input type="text" class="nav-link-target-admin" value="#section" placeholder="#section or https://example.com" data-index="${linkIndex}">
                </div>
                <div class="form-group">
                    <label>Open in New Tab</label>
                    <input type="checkbox" class="nav-link-new-tab-admin" data-index="${linkIndex}">
                </div>
            </div>
        `;
        
        navLinksList.appendChild(linkItem);
        
        // Add event listeners
        linkItem.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });
    }
    
    removeNavigationLinkAdmin(index) {
        const navLinksList = document.getElementById('nav-links-admin-list');
        if (navLinksList && navLinksList.children[index]) {
            navLinksList.children[index].remove();
            this.updatePreview();
        }
    }
    
    loadNavigationLinksAdmin() {
        // Default navigation links
        const defaultLinks = [
            { text: 'Home', target: '#home', type: 'anchor', newTab: false },
            { text: 'About', target: '#about', type: 'anchor', newTab: false },
            { text: 'Experience', target: '#experience', type: 'anchor', newTab: false },
            { text: 'Skills', target: '#skills', type: 'anchor', newTab: false },
            { text: 'LinkedIn', target: '#linkedin', type: 'anchor', newTab: false },
            { text: 'Testimonials', target: '#testimonials', type: 'anchor', newTab: false },
            { text: 'Contact', target: '#contact', type: 'anchor', newTab: false }
        ];
        
        const navLinksList = document.getElementById('nav-links-admin-list');
        if (!navLinksList) return;
        
        navLinksList.innerHTML = '';
        defaultLinks.forEach((link, index) => {
            const linkItem = document.createElement('div');
            linkItem.className = 'nav-link-item';
            linkItem.innerHTML = `
                <button type="button" class="remove-nav-link" onclick="adminPanel.removeNavigationLinkAdmin(${index})">
                    <i class="fas fa-trash"></i>
                </button>
                <h5>Navigation Link ${index + 1}</h5>
                <div class="form-row">
                    <div class="form-group">
                        <label>Link Text</label>
                        <input type="text" class="nav-link-text-admin" value="${link.text}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Link Type</label>
                        <select class="nav-link-type-admin" data-index="${index}">
                            <option value="anchor" ${link.type === 'anchor' ? 'selected' : ''}>Page Anchor</option>
                            <option value="external" ${link.type === 'external' ? 'selected' : ''}>External URL</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Link Target</label>
                        <input type="text" class="nav-link-target-admin" value="${link.target}" placeholder="#section or https://example.com" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Open in New Tab</label>
                        <input type="checkbox" class="nav-link-new-tab-admin" data-index="${index}" ${link.newTab ? 'checked' : ''}>
                    </div>
                </div>
            `;
            
            navLinksList.appendChild(linkItem);
            
            // Add event listeners
            linkItem.querySelectorAll('input, select').forEach(input => {
                input.addEventListener('input', () => this.updatePreview());
                input.addEventListener('change', () => this.updatePreview());
            });
        });
    }

    // Data Management
    async loadData() {
        try {
            this.websiteData = await this.contentManager.loadAllContent();
            if (Object.keys(this.websiteData).length === 0) {
                // If no data in Supabase, use default structure
                this.websiteData = this.getDefaultData();
            }
            this.populateForms();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showMessage('Error loading data from database', 'error');
            this.websiteData = this.getDefaultData();
            this.populateForms();
        }
    }

    getDefaultData() {
        return {
            hero: {
                greeting: 'Hello, I\'m',
                name: 'Soumita Chatterjee',
                subtitle: 'Australia Immigration Specialist',
                description: 'Driving growth & operational excellence through expertise in global immigration, financial analysis, team leadership & process optimization.',
                image: 'https://soumita.space/images/soumita-office-1.jpeg'
            },
            about: {
                title: 'Bridging Education & Immigration',
                description: 'A unique blend of financial expertise and educational consulting, dedicated to empowering global aspirations.',
                text: `From the meticulous world of audit and accounting to the dynamic realm of education consulting, my career journey has been a testament to adaptability and continuous growth.

Beginning as an Audit & Accounts Assistant, I cultivated an unwavering commitment to precision and accuracy. This foundation is now the cornerstone of my approach to education consulting.

As a Senior Admission Officer specializing in Australian immigration, I've discovered my true calling: helping individuals navigate complex educational and immigration landscapes with clarity and confidence.

My philosophy centers on creating seamless experiences that transform international dreams into reality, backed by rigorous planning, deep industry knowledge, and operational excellence.`
            },
            experience: [
                {
                    title: 'Senior Admissions Officer',
                    company: 'EPA Global',
                    date: 'Aug 2023 – Present',
                    description: 'Headed Australia immigration specialization. Managed cross-functional international teams. Oversaw international student admissions. Designed advanced training programs. Improved operational efficiency by 40%.'
                },
                {
                    title: 'Admissions Officer',
                    company: 'EPA Global',
                    date: 'Apr 2022 – Jul 2023',
                    description: 'Conducted comprehensive application reviews. Facilitated student interviews. Delivered exceptional client service. Processed complex visa applications. Guided on immigration compliance.'
                }
            ],
            skills: {
                'Admissions & Immigration': [
                    { name: 'Australia Specialist', percentage: 95 },
                    { name: 'Visa Application Processing', percentage: 90 },
                    { name: 'Immigration Regulations', percentage: 85 },
                    { name: 'Student Counseling', percentage: 90 },
                    { name: 'Application Review', percentage: 95 }
                ]
            },
            testimonials: [
                {
                    name: 'Ananya S.',
                    title: 'Master\'s Student',
                    quote: 'Soumita transformed my dream of studying in Australia into reality. Her meticulous approach was exceptional.',
                    rating: 5,
                    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
                },
                {
                    name: 'Priya S.',
                    title: 'Senior Colleague',
                    quote: 'Her commitment to excellence and process optimization has elevated our entire team\'s performance.',
                    rating: 5,
                    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
                },
                {
                    name: 'Vikram N.',
                    title: 'Parent of Applicant',
                    quote: 'Her guidance for my son\'s application was invaluable. She is trustworthy, knowledgeable, and incredibly patient.',
                    rating: 5,
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
                },
                {
                    name: 'Sunita K.',
                    title: 'Skilled Migration Applicant',
                    quote: 'The entire visa process was demystified thanks to Soumita. I felt supported at every single step.',
                    rating: 5,
                    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
                }
            ],
            contact: {
                email: 'hello@soumita.space',
                linkedin: 'https://www.linkedin.com/in/soumita-chatterjee',
                location: 'Kolkata, India'
            },
            settings: {
                title: 'Soumita Chatterjee – Australia Immigration Specialist',
                primaryColor: '#6a5acd',
                secondaryColor: '#8e6ee6',
                accentColor: '#ffa726'
            }
        };
    }

    populateForms() {
        // Hero section
        if (this.websiteData.hero) {
            document.getElementById('hero-greeting').value = this.websiteData.hero.greeting || '';
            document.getElementById('hero-name').value = this.websiteData.hero.name || '';
            document.getElementById('hero-subtitle').value = this.websiteData.hero.subtitle || '';
            document.getElementById('hero-description').value = this.websiteData.hero.description || '';
            document.getElementById('hero-image').value = this.websiteData.hero.image || '';
            if (this.websiteData.hero.typewriterTitles) {
                document.getElementById('typewriter-titles').value = this.websiteData.hero.typewriterTitles.join(', ');
            }
            
            // Populate button data
            if (this.websiteData.hero.buttons) {
                this.populateButtonData(this.websiteData.hero.buttons);
            }
            
            // Populate navbar data
            if (this.websiteData.hero.navbar) {
                this.populateNavbarData(this.websiteData.hero.navbar);
            }
        }

        // About section
        if (this.websiteData.about) {
            document.getElementById('about-title').value = this.websiteData.about.title || '';
            document.getElementById('about-description').value = this.websiteData.about.description || '';
            document.getElementById('about-text').value = this.websiteData.about.text || '';
        }

        // Contact section
        if (this.websiteData.contact) {
            document.getElementById('contact-email').value = this.websiteData.contact.email || '';
            document.getElementById('contact-linkedin').value = this.websiteData.contact.linkedin || '';
            document.getElementById('contact-location').value = this.websiteData.contact.location || '';
        }

        // Settings
        if (this.websiteData.settings) {
            document.getElementById('site-title').value = this.websiteData.settings.title || '';
            document.getElementById('primary-color').value = this.websiteData.settings.primaryColor || '#6a5acd';
            document.getElementById('secondary-color').value = this.websiteData.settings.secondaryColor || '#8e6ee6';
            document.getElementById('accent-color').value = this.websiteData.settings.accentColor || '#ffa726';
        }

        // Populate dynamic sections
        this.populateExperience();
        this.populateSkills();
        this.populateTestimonials();
        this.populateLinkedInPosts();
        
        // Populate navigation data
        if (this.websiteData.navigation) {
            this.populateNavigationData(this.websiteData.navigation);
        }
        
        // Populate scripts data
        if (this.websiteData.scripts) {
            this.populateScriptsData(this.websiteData.scripts);
        }
    }
    
    populateButtonData(buttonData) {
        if (!buttonData) return;
        
        // Primary button
        if (buttonData.primary) {
            const primary = buttonData.primary;
            document.getElementById('hero-btn-primary-text').value = primary.text || 'Book a Consultation';
            document.getElementById('hero-btn-primary-link').value = primary.link || '#contact';
            document.getElementById('hero-btn-primary-link-type').value = primary.linkType || 'anchor';
            document.getElementById('hero-btn-primary-new-tab').checked = primary.newTab || false;
            
            if (primary.styling) {
                const styling = primary.styling;
                document.getElementById('hero-btn-primary-bg-start').value = styling.bgStart || '#6a5acd';
                document.getElementById('hero-btn-primary-bg-end').value = styling.bgEnd || '#9370db';
                document.getElementById('hero-btn-primary-text-color').value = styling.textColor || '#ffffff';
                document.getElementById('hero-btn-primary-border').value = styling.borderColor || 'transparent';
                document.getElementById('hero-btn-primary-border-width').value = styling.borderWidth || 0;
                document.getElementById('hero-btn-primary-radius').value = styling.borderRadius || 8;
                document.getElementById('hero-btn-primary-padding').value = styling.padding || 16;
                document.getElementById('hero-btn-primary-font-size').value = styling.fontSize || 16;
            }
        }
        
        // Secondary button
        if (buttonData.secondary) {
            const secondary = buttonData.secondary;
            document.getElementById('hero-btn-secondary-text').value = secondary.text || 'View Experience';
            document.getElementById('hero-btn-secondary-link').value = secondary.link || '#experience';
            document.getElementById('hero-btn-secondary-link-type').value = secondary.linkType || 'anchor';
            document.getElementById('hero-btn-secondary-new-tab').checked = secondary.newTab || false;
            
            if (secondary.styling) {
                const styling = secondary.styling;
                document.getElementById('hero-btn-secondary-bg').value = styling.bgColor || 'transparent';
                document.getElementById('hero-btn-secondary-text-color').value = styling.textColor || '#6a5acd';
                document.getElementById('hero-btn-secondary-border').value = styling.borderColor || '#6a5acd';
                document.getElementById('hero-btn-secondary-border-width').value = styling.borderWidth || 2;
                document.getElementById('hero-btn-secondary-radius').value = styling.borderRadius || 8;
                document.getElementById('hero-btn-secondary-padding').value = styling.padding || 16;
                document.getElementById('hero-btn-secondary-font-size').value = styling.fontSize || 16;
            }
        }
    }
    
    populateNavbarData(navbarData) {
        if (!navbarData) return;
        
        document.getElementById('navbar-style').value = navbarData.style || 'default';
        document.getElementById('navbar-sticky').checked = navbarData.sticky !== false;
        document.getElementById('navbar-bg-color').value = navbarData.bgColor || '#ffffff';
        document.getElementById('navbar-bg-opacity').value = navbarData.bgOpacity || 100;
        document.getElementById('navbar-text-color').value = navbarData.textColor || '#333333';
        document.getElementById('navbar-hover-color').value = navbarData.hoverColor || '#6a5acd';
        document.getElementById('navbar-font-size').value = navbarData.fontSize || 16;
        document.getElementById('navbar-padding').value = navbarData.padding || 20;
        
        // Update opacity display
        const opacityValue = document.getElementById('navbar-opacity-value');
        if (opacityValue) {
            opacityValue.textContent = (navbarData.bgOpacity || 100) + '%';
        }
        
        // Populate navigation links
        if (navbarData.links && navbarData.links.length > 0) {
            this.populateNavigationLinks(navbarData.links);
        }
    }
    
    populateNavigationLinks(links) {
        const navLinksList = document.getElementById('nav-links-list');
        if (!navLinksList) return;
        
        navLinksList.innerHTML = '';
        links.forEach((link, index) => {
            const linkItem = document.createElement('div');
            linkItem.className = 'nav-link-item';
            linkItem.innerHTML = `
                <button type="button" class="remove-nav-link" onclick="adminPanel.removeNavigationLink(${index})">
                    <i class="fas fa-trash"></i>
                </button>
                <h5>Navigation Link ${index + 1}</h5>
                <div class="form-row">
                    <div class="form-group">
                        <label>Link Text</label>
                        <input type="text" class="nav-link-text" value="${link.text || 'Link'}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Link Type</label>
                        <select class="nav-link-type" data-index="${index}">
                            <option value="anchor" ${link.type === 'anchor' ? 'selected' : ''}>Page Anchor</option>
                            <option value="external" ${link.type === 'external' ? 'selected' : ''}>External URL</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Link Target</label>
                        <input type="text" class="nav-link-target" value="${link.target || '#section'}" placeholder="#section or https://example.com" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Open in New Tab</label>
                        <input type="checkbox" class="nav-link-new-tab" data-index="${index}" ${link.newTab ? 'checked' : ''}>
                    </div>
                </div>
            `;
            
            navLinksList.appendChild(linkItem);
            
            // Add event listeners
            linkItem.querySelectorAll('input, select').forEach(input => {
                input.addEventListener('input', () => this.updatePreview());
                input.addEventListener('change', () => this.updatePreview());
            });
        });
    }
    
    populateNavigationData(navigationData) {
        if (!navigationData) return;
        
        // Dark theme colors
        document.getElementById('nav-bg-color').value = navigationData.bgColor || '#1a1a1a';
        document.getElementById('nav-text-color').value = navigationData.textColor || '#ffffff';
        document.getElementById('nav-hover-color').value = navigationData.hoverColor || '#ffd700';
        document.getElementById('nav-active-color').value = navigationData.activeColor || '#ffd700';
        
        // Light theme colors
        document.getElementById('nav-bg-color-light').value = navigationData.bgColorLight || '#ffffff';
        document.getElementById('nav-text-color-light').value = navigationData.textColorLight || '#333333';
        document.getElementById('nav-hover-color-light').value = navigationData.hoverColorLight || '#6a5acd';
        document.getElementById('nav-active-color-light').value = navigationData.activeColorLight || '#6a5acd';
        
        // Other settings
        document.getElementById('nav-bg-opacity').value = navigationData.bgOpacity || 100;
        document.getElementById('nav-font-size').value = navigationData.fontSize || 16;
        document.getElementById('nav-padding').value = navigationData.padding || 20;
        document.getElementById('nav-sticky').checked = navigationData.sticky !== false;
        document.getElementById('nav-show-logo').checked = navigationData.showLogo !== false;
        
        // Logo settings
        document.getElementById('logo-type').value = navigationData.logoType || 'single';
        document.getElementById('logo-size').value = navigationData.logoSize || 40;
        document.getElementById('logo-size-value').textContent = (navigationData.logoSize || 40) + 'px';
        
        // Show/hide logo config based on show logo setting
        const logoConfig = document.getElementById('logo-config');
        if (logoConfig) {
            logoConfig.style.display = navigationData.showLogo !== false ? 'block' : 'none';
        }
        
        // Populate logo previews if logos exist
        if (navigationData.logo) {
            this.updateLogoPreview('logo-preview', 'logo-preview-img', navigationData.logo);
            if (!this.websiteData.navigation) this.websiteData.navigation = {};
            this.websiteData.navigation.logo = navigationData.logo;
        }
        if (navigationData.logoDark) {
            this.updateLogoPreview('logo-dark-preview', 'logo-dark-preview-img', navigationData.logoDark);
            if (!this.websiteData.navigation) this.websiteData.navigation = {};
            this.websiteData.navigation.logoDark = navigationData.logoDark;
        }
        if (navigationData.logoLight) {
            this.updateLogoPreview('logo-light-preview', 'logo-light-preview-img', navigationData.logoLight);
            if (!this.websiteData.navigation) this.websiteData.navigation = {};
            this.websiteData.navigation.logoLight = navigationData.logoLight;
        }
        
        // Update opacity display
        const opacityValue = document.getElementById('nav-opacity-value');
        if (opacityValue) {
            opacityValue.textContent = (navigationData.bgOpacity || 100) + '%';
        }
        
        // Populate navigation links
        if (navigationData.links && navigationData.links.length > 0) {
            this.populateNavigationLinksAdmin(navigationData.links);
        }
    }
    
    populateNavigationLinksAdmin(links) {
        const navLinksList = document.getElementById('nav-links-admin-list');
        if (!navLinksList) return;
        
        navLinksList.innerHTML = '';
        links.forEach((link, index) => {
            const linkItem = document.createElement('div');
            linkItem.className = 'nav-link-item';
            linkItem.innerHTML = `
                <button type="button" class="remove-nav-link" onclick="adminPanel.removeNavigationLinkAdmin(${index})">
                    <i class="fas fa-trash"></i>
                </button>
                <h5>Navigation Link ${index + 1}</h5>
                <div class="form-row">
                    <div class="form-group">
                        <label>Link Text</label>
                        <input type="text" class="nav-link-text-admin" value="${link.text || 'Link'}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Link Type</label>
                        <select class="nav-link-type-admin" data-index="${index}">
                            <option value="anchor" ${link.type === 'anchor' ? 'selected' : ''}>Page Anchor</option>
                            <option value="external" ${link.type === 'external' ? 'selected' : ''}>External URL</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Link Target</label>
                        <input type="text" class="nav-link-target-admin" value="${link.target || '#section'}" placeholder="#section or https://example.com" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Open in New Tab</label>
                        <input type="checkbox" class="nav-link-new-tab-admin" data-index="${index}" ${link.newTab ? 'checked' : ''}>
                    </div>
                </div>
            `;
            
            navLinksList.appendChild(linkItem);
            
            // Add event listeners
            linkItem.querySelectorAll('input, select').forEach(input => {
                input.addEventListener('input', () => this.updatePreview());
                input.addEventListener('change', () => this.updatePreview());
            });
        });
    }
    
    // Script Manager Methods
    initializeScriptManager() {
        this.scripts = [];
        this.initializeScriptModal();
        this.loadScripts();
        this.updateScriptCount();
    }
    
    initializeScriptModal() {
        const addScriptBtn = document.getElementById('add-script-btn');
        const modal = document.getElementById('add-script-modal');
        const closeBtn = document.getElementById('close-script-modal');
        const cancelBtn = document.getElementById('cancel-script');
        const saveBtn = document.getElementById('save-script');
        
        if (addScriptBtn) {
            addScriptBtn.addEventListener('click', () => this.openScriptModal());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeScriptModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeScriptModal());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveScript());
        }
        
        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeScriptModal();
                }
            });
        }
        
        // Conflict detection on input change
        const scriptInputs = ['script-name', 'script-type', 'script-location', 'script-order', 'script-content'];
        scriptInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.checkScriptConflicts());
                input.addEventListener('change', () => this.checkScriptConflicts());
            }
        });
    }
    
    openScriptModal() {
        if (this.scripts.length >= 5) {
            this.showMessage('Maximum 5 scripts allowed', 'warning');
            return;
        }
        
        const modal = document.getElementById('add-script-modal');
        if (modal) {
            modal.style.display = 'block';
            this.resetScriptForm();
            this.checkScriptConflicts();
        }
    }
    
    closeScriptModal() {
        const modal = document.getElementById('add-script-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    resetScriptForm() {
        document.getElementById('script-name').value = '';
        document.getElementById('script-type').value = 'js';
        document.getElementById('script-location').value = 'head';
        document.getElementById('script-order').value = '1';
        document.getElementById('script-content').value = '';
        document.getElementById('script-enabled').checked = true;
        
        const warning = document.getElementById('script-conflict-warning');
        if (warning) {
            warning.style.display = 'none';
        }
    }
    
    checkScriptConflicts() {
        const name = document.getElementById('script-name').value.trim();
        const location = document.getElementById('script-location').value;
        const order = parseInt(document.getElementById('script-order').value);
        const content = document.getElementById('script-content').value.trim();
        
        const conflicts = [];
        
        // Check for duplicate names
        if (this.scripts.some(script => script.name === name && name !== '')) {
            conflicts.push('Script name already exists');
        }
        
        // Check for too many scripts in same location
        const locationCount = this.scripts.filter(script => script.location === location).length;
        if (locationCount >= 3) {
            conflicts.push(`Too many scripts in ${location} (max 3)`);
        }
        
        // Check for duplicate order in same location
        const orderConflict = this.scripts.some(script => 
            script.location === location && script.order === order
        );
        if (orderConflict) {
            conflicts.push(`Load order ${order} already used in ${location}`);
        }
        
        // Check for common conflict patterns in content
        if (content.includes('document.addEventListener') && content.includes('click')) {
            conflicts.push('Potential event listener conflicts detected');
        }
        
        if (content.includes('window.') && content.includes('=')) {
            conflicts.push('Potential global variable conflicts detected');
        }
        
        this.showConflictWarning(conflicts);
    }
    
    showConflictWarning(conflicts) {
        const warning = document.getElementById('script-conflict-warning');
        const message = document.getElementById('conflict-message');
        
        if (warning && message) {
            if (conflicts.length > 0) {
                warning.style.display = 'flex';
                message.textContent = conflicts.join(', ');
            } else {
                warning.style.display = 'none';
            }
        }
    }
    
    saveScript() {
        const name = document.getElementById('script-name').value.trim();
        const type = document.getElementById('script-type').value;
        const location = document.getElementById('script-location').value;
        const order = parseInt(document.getElementById('script-order').value);
        const content = document.getElementById('script-content').value.trim();
        const enabled = document.getElementById('script-enabled').checked;
        
        if (!name || !content) {
            this.showMessage('Script name and content are required', 'error');
            return;
        }
        
        if (this.scripts.length >= 5) {
            this.showMessage('Maximum 5 scripts allowed', 'error');
            return;
        }
        
        const script = {
            id: Date.now(),
            name,
            type,
            location,
            order,
            content,
            enabled
        };
        
        this.scripts.push(script);
        this.renderScripts();
        this.updateScriptCount();
        this.closeScriptModal();
        this.showMessage('Script added successfully', 'success');
    }
    
    removeScript(scriptId) {
        this.scripts = this.scripts.filter(script => script.id !== scriptId);
        this.renderScripts();
        this.updateScriptCount();
        this.showMessage('Script removed successfully', 'success');
    }
    
    toggleScript(scriptId) {
        const script = this.scripts.find(s => s.id === scriptId);
        if (script) {
            script.enabled = !script.enabled;
            this.renderScripts();
            this.showMessage(`Script ${script.enabled ? 'enabled' : 'disabled'}`, 'success');
        }
    }
    
    renderScripts() {
        const scriptsList = document.getElementById('scripts-list');
        if (!scriptsList) return;
        
        scriptsList.innerHTML = '';
        
        this.scripts.forEach(script => {
            const scriptItem = document.createElement('div');
            scriptItem.className = 'script-item';
            scriptItem.innerHTML = `
                <div class="script-item-header">
                    <div>
                        <h4 class="script-item-title">${script.name}</h4>
                        <div class="script-item-meta">
                            <span class="script-item-location">${script.location}</span>
                            <span class="script-item-order">Order: ${script.order}</span>
                            <span class="script-item-type">${script.type.toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="script-item-actions">
                        <div class="script-toggle ${script.enabled ? 'active' : ''}" 
                             onclick="adminPanel.toggleScript(${script.id})"></div>
                        <button type="button" class="btn-remove" onclick="adminPanel.removeScript(${script.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="script-item-content">
                    ${this.escapeHtml(script.content.substring(0, 100))}${script.content.length > 100 ? '...' : ''}
                </div>
                ${script.content.length > 100 ? '<button class="script-expand-btn" onclick="this.previousElementSibling.classList.toggle(\'expanded\'); this.textContent = this.previousElementSibling.classList.contains(\'expanded\') ? \'Show Less\' : \'Show More\'">Show More</button>' : ''}
            `;
            
            scriptsList.appendChild(scriptItem);
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    updateScriptCount() {
        const countElement = document.getElementById('script-count');
        if (countElement) {
            countElement.textContent = this.scripts.length;
        }
    }
    
    loadScripts() {
        // Load from localStorage or database
        const savedScripts = localStorage.getItem('website_scripts');
        if (savedScripts) {
            try {
                this.scripts = JSON.parse(savedScripts);
                this.renderScripts();
                this.updateScriptCount();
            } catch (error) {
                console.error('Error loading scripts:', error);
            }
        }
    }
    
    collectScriptsData() {
        // Save to localStorage
        localStorage.setItem('website_scripts', JSON.stringify(this.scripts));
        return this.scripts;
    }
    
    populateScriptsData(scripts) {
        if (!scripts || !Array.isArray(scripts)) return;
        
        this.scripts = scripts;
        this.renderScripts();
        this.updateScriptCount();
    }
    
    // Dark Mode Functionality
    initializeDarkMode() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
        
        // Check for saved dark mode preference
        const savedDarkMode = localStorage.getItem('admin_dark_mode');
        if (savedDarkMode === 'true') {
            this.enableDarkMode();
        }
    }
    
    toggleDarkMode() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (isDarkMode) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }
    }
    
    enableDarkMode() {
        document.body.classList.add('dark-mode');
        localStorage.setItem('admin_dark_mode', 'true');
        
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
    }
    
    disableDarkMode() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('admin_dark_mode', 'false');
        
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
    }

    // Dynamic Section Population
    populateExperience() {
        const container = document.getElementById('experience-list');
        if (!container) return;

        container.innerHTML = '';
        if (this.websiteData.experience) {
            this.websiteData.experience.forEach((exp, index) => {
                container.appendChild(this.createExperienceItem(exp, index));
            });
        }
    }

    populateSkills() {
        console.log('Populating skills...');
        console.log('Current skills data:', this.websiteData.skills);
        
        const categories = {
            'admissions': 'Admissions & Immigration',
            'management': 'Management & Leadership', 
            'finance': 'Finance & Accounting',
            'languages': 'Languages & Communication'
        };

        Object.entries(categories).forEach(([categoryId, categoryName]) => {
            const container = document.getElementById(`skills-${categoryId}`);
            console.log(`Looking for container: skills-${categoryId}`, container);
            
            if (!container) {
                console.log(`Container not found for ${categoryId}`);
                return;
            }

            container.innerHTML = '';
            
            // Check if skills exist for this category
            if (this.websiteData.skills && this.websiteData.skills[categoryName] && this.websiteData.skills[categoryName].length > 0) {
                console.log(`Found skills for ${categoryName}:`, this.websiteData.skills[categoryName]);
                this.websiteData.skills[categoryName].forEach((skill, index) => {
                    container.appendChild(this.createSkillItem(skill, index, categoryId));
                });
            } else {
                console.log(`No skills found for ${categoryName}, adding default skills`);
                // Add default skills for empty categories
                const defaultSkills = this.getDefaultSkillsForCategory(categoryName);
                defaultSkills.forEach((skill, index) => {
                    container.appendChild(this.createSkillItem(skill, index, categoryId));
                });
            }
        });
    }

    getDefaultSkillsForCategory(categoryName) {
        const defaultSkills = {
            'Admissions & Immigration': [
                { name: 'Australia Specialist', percentage: 95, color: '#6a5acd' },
                { name: 'Visa Application Processing', percentage: 90, color: '#8e6ee6' },
                { name: 'Immigration Regulations', percentage: 85, color: '#ffa726' },
                { name: 'Student Counseling', percentage: 90, color: '#6a5acd' },
                { name: 'Application Review', percentage: 95, color: '#8e6ee6' }
            ],
            'Management & Leadership': [
                { name: 'Team Leadership', percentage: 85, color: '#6a5acd' },
                { name: 'Process Optimization', percentage: 90, color: '#8e6ee6' },
                { name: 'Training & Development', percentage: 80, color: '#ffa726' },
                { name: 'Decision-Making', percentage: 85, color: '#6a5acd' },
                { name: 'Stakeholder Management', percentage: 80, color: '#8e6ee6' }
            ],
            'Finance & Accounting': [
                { name: 'Financial Analysis', percentage: 85, color: '#6a5acd' },
                { name: 'Accounting Software', percentage: 75, color: '#8e6ee6' },
                { name: 'Reports Management', percentage: 90, color: '#ffa726' },
                { name: 'Reconciliation', percentage: 85, color: '#6a5acd' }
            ],
            'Languages & Communication': [
                { name: 'English', percentage: 90, color: '#6a5acd' },
                { name: 'Hindi', percentage: 85, color: '#8e6ee6' },
                { name: 'Bengali', percentage: 100, color: '#ffa726' },
                { name: 'Written Communication', percentage: 90, color: '#6a5acd' },
                { name: 'Presentation Skills', percentage: 85, color: '#8e6ee6' }
            ]
        };
        
        return defaultSkills[categoryName] || [];
    }

    populateTestimonials() {
        console.log('Populating testimonials...');
        console.log('Current testimonials data:', this.websiteData.testimonials);
        
        const container = document.getElementById('testimonials-list');
        if (!container) {
            console.log('Testimonials container not found');
            return;
        }

        container.innerHTML = '';
        if (this.websiteData.testimonials && this.websiteData.testimonials.length > 0) {
            console.log(`Found ${this.websiteData.testimonials.length} testimonials`);
            this.websiteData.testimonials.forEach((testimonial, index) => {
                console.log(`Creating testimonial ${index}:`, testimonial);
                container.appendChild(this.createTestimonialItem(testimonial, index));
            });
        } else {
            console.log('No testimonials found, using default testimonials');
            // Add default testimonials if none exist
            const defaultTestimonials = this.getDefaultTestimonials();
            defaultTestimonials.forEach((testimonial, index) => {
                container.appendChild(this.createTestimonialItem(testimonial, index));
            });
        }

        // Bind file upload handlers for testimonials
        this.bindTestimonialFileUploads();
    }

    populateLinkedInPosts() {
        console.log('Populating LinkedIn posts...');
        console.log('Current LinkedIn data:', this.websiteData.linkedin);
        
        const container = document.getElementById('linkedin-posts-list');
        if (!container) {
            console.log('LinkedIn posts container not found');
            return;
        }

        container.innerHTML = '';
        if (this.websiteData.linkedin && this.websiteData.linkedin.length > 0) {
            console.log(`Found ${this.websiteData.linkedin.length} LinkedIn posts`);
            this.websiteData.linkedin.forEach((post, index) => {
                console.log(`Creating LinkedIn post ${index}:`, post);
                container.appendChild(this.createLinkedInPostItem(post, index));
            });
        } else {
            console.log('No LinkedIn posts found, using default posts');
            const defaultPosts = this.getDefaultLinkedInPosts();
            defaultPosts.forEach((post, index) => {
                container.appendChild(this.createLinkedInPostItem(post, index));
            });
        }
    }

    getDefaultLinkedInPosts() {
        return [
            {
                url: 'https://www.linkedin.com/posts/soumita-chatterjee_australia-immigration-specialist-activity-123456789',
                title: 'Discipline > Motivation',
                description: 'Discipline > Motivation. I don\'t wait for motivation. It\'s Thursday. Work needs to get done. Problems need solving. Teams need clarity. Students need direction. That\'s more than enough reason to show up.',
                date: '1 week ago',
                image: ''
            },
            {
                url: 'https://www.linkedin.com/posts/soumita-chatterjee_digital-transformation-immigration-activity-123456789',
                title: 'The impact of digital transformation on immigration processes',
                description: 'Exploring how technology is revolutionizing visa applications and making the process more efficient for students and professionals.',
                date: '2 weeks ago',
                image: ''
            }
        ];
    }

    getDefaultTestimonials() {
        return [
            {
                name: 'Ananya S.',
                title: 'Master\'s Student',
                quote: 'Soumita transformed my dream of studying in Australia into reality. Her meticulous approach was exceptional.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
            },
            {
                name: 'Priya S.',
                title: 'Senior Colleague',
                quote: 'Her commitment to excellence and process optimization has elevated our entire team\'s performance.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
            },
            {
                name: 'Vikram N.',
                title: 'Parent of Applicant',
                quote: 'Her guidance for my son\'s application was invaluable. She is trustworthy, knowledgeable, and incredibly patient.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            },
            {
                name: 'Sunita K.',
                title: 'Skilled Migration Applicant',
                quote: 'The entire visa process was demystified thanks to Soumita. I felt supported at every single step.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
            }
        ];
    }

    // Create Dynamic Items
    createExperienceItem(exp, index) {
        const div = document.createElement('div');
        div.className = 'experience-item';
        div.innerHTML = `
            <h3>Experience ${index + 1}</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="exp-title" value="${exp.title}" data-index="${index}">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" class="exp-company" value="${exp.company}" data-index="${index}">
                </div>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="text" class="exp-date" value="${exp.date}" data-index="${index}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="exp-description" rows="4" data-index="${index}">${exp.description}</textarea>
            </div>
            <div class="item-actions">
                <button class="btn-remove" onclick="adminPanel.removeExperience(${index})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        
        // Initialize advanced editor for the description textarea
        setTimeout(() => {
            const textarea = div.querySelector('.exp-description');
            if (textarea) {
                const uniqueId = `exp-description-${index}-${Date.now()}`;
                textarea.id = uniqueId;
                try {
                    this.advancedEditors[uniqueId] = new AdvancedEditor(uniqueId, {
                        enableRichText: true,
                        enableHtml: true,
                        enableGoogleFonts: true,
                        defaultMode: 'text'
                    });
                    
                    // Add event listener for content changes
                    textarea.addEventListener('input', (e) => {
                        this.updatePreview(e.target);
                    });
                } catch (error) {
                    console.error(`Failed to initialize advanced editor for experience ${index}:`, error);
                }
            }
        }, 100);
        
        return div;
    }

    createSkillItem(skill, index, categoryId) {
        const div = document.createElement('div');
        div.className = 'skill-item';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Skill Name</label>
                    <input type="text" class="skill-name" value="${skill.name}" data-index="${index}" data-category="${categoryId}">
                </div>
                <div class="form-group">
                    <label>Percentage</label>
                    <input type="number" class="skill-percentage" value="${skill.percentage}" min="0" max="100" data-index="${index}" data-category="${categoryId}">
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <input type="color" class="skill-color" value="${skill.color || '#6a5acd'}" data-index="${index}" data-category="${categoryId}">
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-remove" onclick="adminPanel.removeSkill(${index}, '${categoryId}')">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        return div;
    }

    createTestimonialItem(testimonial, index) {
        const div = document.createElement('div');
        div.className = 'testimonial-item';
        div.innerHTML = `
            <h3>Testimonial ${index + 1}</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="testimonial-name" value="${testimonial.name || ''}" data-index="${index}">
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="testimonial-title" value="${testimonial.title || ''}" data-index="${index}">
                </div>
            </div>
            <div class="form-group">
                <label>Profile Image</label>
                <div class="image-upload-container">
                    <div class="image-input-group">
                        <label class="input-label">Image URL</label>
                        <input type="url" class="testimonial-image" value="${testimonial.image || ''}" placeholder="https://example.com/image.jpg" data-index="${index}">
                    </div>
                    <div class="image-input-group">
                        <label class="input-label">Or Upload Image</label>
                        <input type="file" class="testimonial-image-upload" accept="image/*" data-index="${index}">
                        <small>Max 5MB, JPG, PNG, or GIF</small>
                    </div>
                    <div class="image-preview testimonial-image-preview" data-index="${index}">
                        <img class="testimonial-preview-img" src="${testimonial.image || ''}" alt="Testimonial preview" onerror="this.style.display='none'">
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Rating (1-5)</label>
                <input type="number" class="testimonial-rating" value="${testimonial.rating || 5}" min="1" max="5" data-index="${index}">
            </div>
            <div class="form-group">
                <label>Quote</label>
                <textarea class="testimonial-quote" rows="3" data-index="${index}">${testimonial.quote || ''}</textarea>
            </div>
            <div class="item-actions">
                <button class="btn-remove" onclick="adminPanel.removeTestimonial(${index})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        
        // Initialize advanced editor for the quote textarea
        setTimeout(() => {
            const textarea = div.querySelector('.testimonial-quote');
            if (textarea) {
                const uniqueId = `testimonial-quote-${index}-${Date.now()}`;
                textarea.id = uniqueId;
                try {
                    this.advancedEditors[uniqueId] = new AdvancedEditor(uniqueId, {
                        enableRichText: true,
                        enableHtml: true,
                        enableGoogleFonts: true,
                        defaultMode: 'text'
                    });
                    
                    // Add event listener for content changes
                    textarea.addEventListener('input', (e) => {
                        this.updatePreview(e.target);
                    });
                } catch (error) {
                    console.error(`Failed to initialize advanced editor for testimonial ${index}:`, error);
                }
            }
        }, 100);
        
        return div;
    }

    createLinkedInPostItem(post, index) {
        const div = document.createElement('div');
        div.className = 'linkedin-post-item';
        div.setAttribute('data-index', index);
        div.innerHTML = `
            <h3>LinkedIn Post ${index + 1}</h3>
            <div class="form-group">
                <label>LinkedIn Post URL</label>
                <input type="url" class="linkedin-post-url" value="${post.url || ''}" data-index="${index}" placeholder="https://www.linkedin.com/posts/...">
                <small>Enter the LinkedIn post URL</small>
            </div>
            <div class="form-group">
                <label>Post Title</label>
                <input type="text" class="linkedin-post-title" value="${post.title || ''}" data-index="${index}" placeholder="Enter post title">
            </div>
            <div class="form-group">
                <label>Post Content</label>
                <textarea class="linkedin-post-description" rows="4" data-index="${index}" placeholder="Enter the post content/description">${post.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Cover Image URL</label>
                <input type="url" class="linkedin-post-image" value="${post.image || ''}" data-index="${index}" placeholder="https://example.com/image.jpg">
                <small>Optional: Add an image URL for the post</small>
            </div>
            <div class="form-group">
                <label>Date Posted</label>
                <input type="text" class="linkedin-post-date" value="${post.date || ''}" data-index="${index}" placeholder="e.g., 2 days ago, 1 week ago">
            </div>
            <div class="item-actions">
                <button class="btn-remove" onclick="adminPanel.removeLinkedInPost(${index})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        
        // Initialize advanced editor for the description textarea
        setTimeout(() => {
            const textarea = div.querySelector('.linkedin-post-description');
            if (textarea) {
                const uniqueId = `linkedin-post-description-${index}-${Date.now()}`;
                textarea.id = uniqueId;
                try {
                    this.advancedEditors[uniqueId] = new AdvancedEditor(uniqueId, {
                        enableRichText: true,
                        enableHtml: true,
                        enableGoogleFonts: true,
                        defaultMode: 'text'
                    });
                    
                    // Add event listener for content changes
                    textarea.addEventListener('input', (e) => {
                        this.updatePreview(e.target);
                    });
                } catch (error) {
                    console.error(`Failed to initialize advanced editor for LinkedIn post ${index}:`, error);
                }
            }
        }, 100);
        
        return div;
    }

    // Add Items
    addExperience() {
        if (!this.websiteData.experience) this.websiteData.experience = [];
        
        const newExp = {
            title: 'New Position',
            company: 'Company Name',
            date: 'Date Range',
            description: 'Description of responsibilities and achievements.'
        };
        
        this.websiteData.experience.push(newExp);
        this.populateExperience();
        this.showMessage('Experience added!', 'success');
    }

    addSkill(categoryId) {
        console.log('Adding skill for category:', categoryId);
        
        if (!this.websiteData.skills) this.websiteData.skills = {};
        
        const categories = {
            'admissions': 'Admissions & Immigration',
            'management': 'Management & Leadership', 
            'finance': 'Finance & Accounting',
            'languages': 'Languages & Communication'
        };
        
        const categoryName = categories[categoryId];
        console.log('Category name:', categoryName);
        
        if (!categoryName) {
            console.log('Invalid category ID:', categoryId);
            return;
        }
        
        if (!this.websiteData.skills[categoryName]) {
            this.websiteData.skills[categoryName] = [];
        }
        
        const newSkill = {
            name: 'New Skill',
            percentage: 80,
            color: '#6a5acd'
        };
        
        console.log('Adding skill to category:', categoryName, newSkill);
        this.websiteData.skills[categoryName].push(newSkill);
        this.populateSkills();
        this.showMessage('Skill added!', 'success');
    }

    addTestimonial() {
        if (!this.websiteData.testimonials) this.websiteData.testimonials = [];
        
        const newTestimonial = {
            name: 'Client Name',
            title: 'Client Title',
            quote: 'Client testimonial quote.',
            rating: 5,
            image: ''
        };
        
        this.websiteData.testimonials.push(newTestimonial);
        this.populateTestimonials();
        this.showMessage('Testimonial added!', 'success');
    }

    addLinkedInPost() {
        if (!this.websiteData.linkedin) this.websiteData.linkedin = [];
        
        const newPost = {
            url: 'https://www.linkedin.com/posts/...',
            title: 'LinkedIn Post Title',
            description: 'Brief description of the post content...',
            date: '2 days ago'
        };
        
        this.websiteData.linkedin.push(newPost);
        this.populateLinkedInPosts();
        this.showMessage('LinkedIn post added!', 'success');
    }

    // Remove Items
    removeExperience(index) {
        // Clean up advanced editor if it exists
        const editorId = `exp-description-${index}`;
        if (this.advancedEditors && this.advancedEditors[editorId]) {
            this.advancedEditors[editorId].destroy();
            delete this.advancedEditors[editorId];
        }
        
        this.websiteData.experience.splice(index, 1);
        this.populateExperience();
        this.showMessage('Experience removed!', 'success');
    }

    removeSkill(index, categoryId) {
        const categories = {
            'admissions': 'Admissions & Immigration',
            'management': 'Management & Leadership', 
            'finance': 'Finance & Accounting',
            'languages': 'Languages & Communication'
        };
        
        const categoryName = categories[categoryId];
        if (!categoryName || !this.websiteData.skills[categoryName]) return;
        
        this.websiteData.skills[categoryName].splice(index, 1);
        this.populateSkills();
        this.showMessage('Skill removed!', 'success');
    }

    removeTestimonial(index) {
        // Clean up advanced editor if it exists
        const editorId = `testimonial-quote-${index}`;
        if (this.advancedEditors && this.advancedEditors[editorId]) {
            this.advancedEditors[editorId].destroy();
            delete this.advancedEditors[editorId];
        }
        
        this.websiteData.testimonials.splice(index, 1);
        this.populateTestimonials();
        this.showMessage('Testimonial removed!', 'success');
    }

    removeLinkedInPost(index) {
        // Clean up advanced editor if it exists
        const editorId = `linkedin-post-description-${index}`;
        if (this.advancedEditors && this.advancedEditors[editorId]) {
            this.advancedEditors[editorId].destroy();
            delete this.advancedEditors[editorId];
        }
        
        this.websiteData.linkedin.splice(index, 1);
        this.populateLinkedInPosts();
        this.showMessage('LinkedIn post removed!', 'success');
    }



    // Update Preview
    updatePreview(input) {
        const fieldId = input.id;
        const value = input.value;
        
        // Update data
        if (fieldId.startsWith('hero-')) {
            const field = fieldId.replace('hero-', '');
            if (!this.websiteData.hero) this.websiteData.hero = {};
            this.websiteData.hero[field] = value;
        } else if (fieldId.startsWith('about-')) {
            const field = fieldId.replace('about-', '');
            if (!this.websiteData.about) this.websiteData.about = {};
            this.websiteData.about[field] = value;
        } else if (fieldId.startsWith('contact-')) {
            const field = fieldId.replace('contact-', '');
            if (!this.websiteData.contact) this.websiteData.contact = {};
            this.websiteData.contact[field] = value;
        } else if (fieldId.startsWith('site-')) {
            const field = fieldId.replace('site-', '');
            if (!this.websiteData.settings) this.websiteData.settings = {};
            this.websiteData.settings[field] = value;
        }

        // Update preview iframe
        this.updatePreviewIframe();
    }

    updatePreviewIframe() {
        const iframe = document.getElementById('preview-iframe');
        if (iframe && iframe.contentWindow) {
            try {
                // Send data to iframe
                iframe.contentWindow.postMessage({
                    type: 'UPDATE_WEBSITE',
                    data: this.websiteData
                }, '*');
                
                console.log('Data sent to iframe:', this.websiteData);
                
            } catch (error) {
                console.error('Error sending data to iframe:', error);
                // Fallback: reload iframe with timestamp
                const currentUrl = new URL(iframe.src);
                currentUrl.searchParams.set('timestamp', Date.now());
                iframe.src = currentUrl.toString();
            }
        } else {
            console.error('Iframe or contentWindow not available');
            // Fallback: reload iframe
            if (iframe) {
                const currentUrl = new URL(iframe.src);
                currentUrl.searchParams.set('timestamp', Date.now());
                iframe.src = currentUrl.toString();
            }
        }
    }

    // Save Changes
    async saveChanges() {
        try {
            console.log('Starting save process...');
            this.logToDebug('Starting save process...', 'info');
            
            // Collect all form data
            this.collectFormData();
            console.log('Form data collected:', this.websiteData);
            this.logToDebug(`Form data collected: ${JSON.stringify(this.websiteData)}`, 'info');
            
            // Check if Supabase is available
            if (!this.supabase) {
                console.error('Supabase client not available');
                this.showMessage('Database connection not available', 'error');
                return;
            }
            
            // Save each section to Supabase directly
            for (const [sectionName, content] of Object.entries(this.websiteData)) {
                console.log(`Saving section: ${sectionName}`, content);
                this.logToDebug(`Saving section: ${sectionName}`, 'info');
                
                const upsertData = {
                    section_name: sectionName,
                    content: content
                };
                console.log('Upsert data:', upsertData);
                
                const { data, error } = await this.supabase
                    .from('website_content')
                    .upsert(upsertData, {
                        onConflict: 'section_name'
                    });
                
                if (error) {
                    console.error(`Error saving ${sectionName}:`, error);
                    this.logToDebug(`Error saving ${sectionName}: ${error.message}`, 'error');
                    throw error;
                }
                
                console.log(`Successfully saved ${sectionName}`);
                this.logToDebug(`Successfully saved ${sectionName}`, 'success');
            }
            
            // Update the main website
            this.updateMainWebsite();
            
            // Refresh the main website content
            if (window.refreshWebsiteContent) {
                this.logToDebug('Refreshing main website content...', 'info');
                await window.refreshWebsiteContent();
                this.logToDebug('Main website content refreshed', 'success');
            } else {
                this.logToDebug('Refresh function not available', 'warning');
            }
            
            this.showMessage('Changes saved successfully to database!', 'success');
        } catch (error) {
            console.error('Error saving data:', error);
            this.showMessage('Error saving data to database: ' + error.message, 'error');
        }
    }

    collectFormData() {
        console.log('Collecting form data...');
        
        try {
            // Hero section
            const heroGreeting = document.getElementById('hero-greeting');
            const heroName = document.getElementById('hero-name');
            const heroSubtitle = document.getElementById('hero-subtitle');
            const heroDescription = document.getElementById('hero-description');
            const heroImage = document.getElementById('hero-image');
            
            console.log('Hero fields found:', {
                greeting: heroGreeting,
                name: heroName,
                subtitle: heroSubtitle,
                description: heroDescription,
                image: heroImage
            });
            
            // Get description value from advanced editor if available
            let heroDescriptionValue = heroDescription ? heroDescription.value : '';
            if (heroDescription && heroDescription.id && this.advancedEditors && this.advancedEditors[heroDescription.id]) {
                heroDescriptionValue = this.advancedEditors[heroDescription.id].getValue();
            }
            
            // Get typewriter titles value from advanced editor if available
            let typewriterTitlesValue = document.getElementById('typewriter-titles') ? document.getElementById('typewriter-titles').value : '';
            const typewriterTitlesElement = document.getElementById('typewriter-titles');
            if (typewriterTitlesElement && typewriterTitlesElement.id && this.advancedEditors && this.advancedEditors[typewriterTitlesElement.id]) {
                typewriterTitlesValue = this.advancedEditors[typewriterTitlesElement.id].getValue();
            }
            
            // Collect button data
            const buttonData = this.collectButtonData();
            const navbarData = this.collectNavbarData();
            
            this.websiteData.hero = {
                greeting: heroGreeting ? heroGreeting.value : '',
                name: heroName ? heroName.value : '',
                subtitle: heroSubtitle ? heroSubtitle.value : '',
                description: heroDescriptionValue,
                image: heroImage ? heroImage.value : '',
                typewriterTitles: typewriterTitlesValue.split(',').map(t => t.trim()),
                buttons: buttonData,
                navbar: navbarData
            };

            // About section
            const aboutTitle = document.getElementById('about-title');
            const aboutDescription = document.getElementById('about-description');
            const aboutText = document.getElementById('about-text');
            
            if (!aboutTitle || !aboutDescription || !aboutText) {
                throw new Error('About section fields not found');
            }
            
            // Get values from advanced editors if available
            let aboutDescriptionValue = aboutDescription.value;
            let aboutTextValue = aboutText.value;
            
            if (aboutDescription.id && this.advancedEditors && this.advancedEditors[aboutDescription.id]) {
                aboutDescriptionValue = this.advancedEditors[aboutDescription.id].getValue();
            }
            
            if (aboutText.id && this.advancedEditors && this.advancedEditors[aboutText.id]) {
                aboutTextValue = this.advancedEditors[aboutText.id].getValue();
            }
            
            this.websiteData.about = {
                title: aboutTitle.value,
                description: aboutDescriptionValue,
                text: aboutTextValue
            };

            // Contact section
            const contactEmail = document.getElementById('contact-email');
            const contactLinkedin = document.getElementById('contact-linkedin');
            const contactLocation = document.getElementById('contact-location');
            
            if (!contactEmail || !contactLinkedin || !contactLocation) {
                throw new Error('Contact section fields not found');
            }
            
            this.websiteData.contact = {
                email: contactEmail.value,
                linkedin: contactLinkedin.value,
                location: contactLocation.value
            };

            // Settings
            const siteTitle = document.getElementById('site-title');
            const primaryColor = document.getElementById('primary-color');
            const secondaryColor = document.getElementById('secondary-color');
            const accentColor = document.getElementById('accent-color');
            
            if (!siteTitle || !primaryColor || !secondaryColor || !accentColor) {
                throw new Error('Settings fields not found');
            }
            
            this.websiteData.settings = {
                title: siteTitle.value,
                primaryColor: primaryColor.value,
                secondaryColor: secondaryColor.value,
                accentColor: accentColor.value,
                theme: this.websiteData.settings?.theme || 'modern'
            };

                    // Collect dynamic data
        this.collectExperienceData();
        this.collectSkillsData();
        this.collectTestimonialsData();
        this.collectLinkedInData();
        this.collectFormConfiguration();
        
        // Collect navigation data
        this.websiteData.navigation = this.collectNavigationData();
        
        // Collect scripts data
        this.websiteData.scripts = this.collectScriptsData();
            
        } catch (error) {
            console.error('Error in collectFormData:', error);
            throw error;
        }
    }

    collectExperienceData() {
        const experiences = [];
        document.querySelectorAll('.experience-item').forEach((item, index) => {
            const textarea = item.querySelector('.exp-description');
            let description = textarea.value;
            
            // Check if there's an advanced editor for this textarea
            if (textarea.id && this.advancedEditors && this.advancedEditors[textarea.id]) {
                description = this.advancedEditors[textarea.id].getValue();
            }
            
            experiences.push({
                title: item.querySelector('.exp-title').value,
                company: item.querySelector('.exp-company').value,
                date: item.querySelector('.exp-date').value,
                description: description
            });
        });
        this.websiteData.experience = experiences;
    }

    collectSkillsData() {
        const categories = {
            'admissions': 'Admissions & Immigration',
            'management': 'Management & Leadership', 
            'finance': 'Finance & Accounting',
            'languages': 'Languages & Communication'
        };
        
        this.websiteData.skills = {};
        
                    Object.entries(categories).forEach(([categoryId, categoryName]) => {
                const skills = [];
                document.querySelectorAll(`#skills-${categoryId} .skill-item`).forEach((item, index) => {
                    skills.push({
                        name: item.querySelector('.skill-name').value,
                        percentage: parseInt(item.querySelector('.skill-percentage').value),
                        color: item.querySelector('.skill-color').value
                    });
                });
                this.websiteData.skills[categoryName] = skills;
            });
    }

    collectTestimonialsData() {
        const testimonials = [];
        document.querySelectorAll('.testimonial-item').forEach((item, index) => {
            const textarea = item.querySelector('.testimonial-quote');
            let quote = textarea.value;
            
            // Check if there's an advanced editor for this textarea
            if (textarea.id && this.advancedEditors && this.advancedEditors[textarea.id]) {
                quote = this.advancedEditors[textarea.id].getValue();
            }
            
            testimonials.push({
                name: item.querySelector('.testimonial-name').value,
                title: item.querySelector('.testimonial-title').value,
                quote: quote,
                rating: parseInt(item.querySelector('.testimonial-rating').value) || 5,
                image: item.querySelector('.testimonial-image').value
            });
        });
        this.websiteData.testimonials = testimonials;
    }

    collectLinkedInData() {
        const linkedinPosts = [];
        document.querySelectorAll('.linkedin-post-item').forEach((item, index) => {
            const textarea = item.querySelector('.linkedin-post-description');
            let description = textarea.value;
            
            // Check if there's an advanced editor for this textarea
            if (textarea.id && this.advancedEditors && this.advancedEditors[textarea.id]) {
                description = this.advancedEditors[textarea.id].getValue();
            }
            
            linkedinPosts.push({
                url: item.querySelector('.linkedin-post-url').value,
                title: item.querySelector('.linkedin-post-title').value,
                description: description,
                date: item.querySelector('.linkedin-post-date').value,
                image: item.querySelector('.linkedin-post-image').value
            });
        });
        this.websiteData.linkedin = linkedinPosts;
    }
    
    collectButtonData() {
        return {
            primary: {
                text: document.getElementById('hero-btn-primary-text')?.value || 'Book a Consultation',
                link: document.getElementById('hero-btn-primary-link')?.value || '#contact',
                linkType: document.getElementById('hero-btn-primary-link-type')?.value || 'anchor',
                newTab: document.getElementById('hero-btn-primary-new-tab')?.checked || false,
                styling: {
                    bgStart: document.getElementById('hero-btn-primary-bg-start')?.value || '#6a5acd',
                    bgEnd: document.getElementById('hero-btn-primary-bg-end')?.value || '#9370db',
                    textColor: document.getElementById('hero-btn-primary-text-color')?.value || '#ffffff',
                    borderColor: document.getElementById('hero-btn-primary-border')?.value || 'transparent',
                    borderWidth: parseInt(document.getElementById('hero-btn-primary-border-width')?.value || '0'),
                    borderRadius: parseInt(document.getElementById('hero-btn-primary-radius')?.value || '8'),
                    padding: parseInt(document.getElementById('hero-btn-primary-padding')?.value || '16'),
                    fontSize: parseInt(document.getElementById('hero-btn-primary-font-size')?.value || '16')
                }
            },
            secondary: {
                text: document.getElementById('hero-btn-secondary-text')?.value || 'View Experience',
                link: document.getElementById('hero-btn-secondary-link')?.value || '#experience',
                linkType: document.getElementById('hero-btn-secondary-link-type')?.value || 'anchor',
                newTab: document.getElementById('hero-btn-secondary-new-tab')?.checked || false,
                styling: {
                    bgColor: document.getElementById('hero-btn-secondary-bg')?.value || 'transparent',
                    textColor: document.getElementById('hero-btn-secondary-text-color')?.value || '#6a5acd',
                    borderColor: document.getElementById('hero-btn-secondary-border')?.value || '#6a5acd',
                    borderWidth: parseInt(document.getElementById('hero-btn-secondary-border-width')?.value || '2'),
                    borderRadius: parseInt(document.getElementById('hero-btn-secondary-radius')?.value || '8'),
                    padding: parseInt(document.getElementById('hero-btn-secondary-padding')?.value || '16'),
                    fontSize: parseInt(document.getElementById('hero-btn-secondary-font-size')?.value || '16')
                }
            }
        };
    }
    
    collectNavbarData() {
        const navLinks = [];
        document.querySelectorAll('.nav-link-item').forEach((item, index) => {
            navLinks.push({
                text: item.querySelector('.nav-link-text')?.value || 'Link',
                target: item.querySelector('.nav-link-target')?.value || '#section',
                type: item.querySelector('.nav-link-type')?.value || 'anchor',
                newTab: item.querySelector('.nav-link-new-tab')?.checked || false
            });
        });
        
        return {
            style: document.getElementById('navbar-style')?.value || 'default',
            sticky: document.getElementById('navbar-sticky')?.checked || true,
            bgColor: document.getElementById('navbar-bg-color')?.value || '#ffffff',
            bgOpacity: parseInt(document.getElementById('navbar-bg-opacity')?.value || '100'),
            textColor: document.getElementById('navbar-text-color')?.value || '#333333',
            hoverColor: document.getElementById('navbar-hover-color')?.value || '#6a5acd',
            fontSize: parseInt(document.getElementById('navbar-font-size')?.value || '16'),
            padding: parseInt(document.getElementById('navbar-padding')?.value || '20'),
            links: navLinks
        };
    }
    
    collectNavigationData() {
        const navLinks = [];
        document.querySelectorAll('#nav-links-admin-list .nav-link-item').forEach((item, index) => {
            navLinks.push({
                text: item.querySelector('.nav-link-text-admin')?.value || 'Link',
                target: item.querySelector('.nav-link-target-admin')?.value || '#section',
                type: item.querySelector('.nav-link-type-admin')?.value || 'anchor',
                newTab: item.querySelector('.nav-link-new-tab-admin')?.checked || false
            });
        });
        
        return {
            bgColor: document.getElementById('nav-bg-color')?.value || '#1a1a1a',
            bgColorLight: document.getElementById('nav-bg-color-light')?.value || '#ffffff',
            bgOpacity: parseInt(document.getElementById('nav-bg-opacity')?.value || '100'),
            textColor: document.getElementById('nav-text-color')?.value || '#ffffff',
            textColorLight: document.getElementById('nav-text-color-light')?.value || '#333333',
            hoverColor: document.getElementById('nav-hover-color')?.value || '#ffd700',
            hoverColorLight: document.getElementById('nav-hover-color-light')?.value || '#6a5acd',
            activeColor: document.getElementById('nav-active-color')?.value || '#ffd700',
            activeColorLight: document.getElementById('nav-active-color-light')?.value || '#6a5acd',
            fontSize: parseInt(document.getElementById('nav-font-size')?.value || '16'),
            padding: parseInt(document.getElementById('nav-padding')?.value || '20'),
            sticky: document.getElementById('nav-sticky')?.checked || true,
            showLogo: document.getElementById('nav-show-logo')?.checked || true,
            logoType: document.getElementById('logo-type')?.value || 'single',
            logoSize: parseInt(document.getElementById('logo-size')?.value || '40'),
            logo: this.websiteData.navigation?.logo || null,
            logoDark: this.websiteData.navigation?.logoDark || null,
            logoLight: this.websiteData.navigation?.logoLight || null,
            links: navLinks
        };
    }
    
    collectFormConfiguration() {
        const formType = document.getElementById('form-type')?.value || 'email';
        
        // Get autoresponder code value from advanced editor if available
        let autoresponderCodeValue = document.getElementById('autoresponder-code')?.value || '';
        const autoresponderCodeElement = document.getElementById('autoresponder-code');
        if (autoresponderCodeElement && autoresponderCodeElement.id && this.advancedEditors && this.advancedEditors[autoresponderCodeElement.id]) {
            autoresponderCodeValue = this.advancedEditors[autoresponderCodeElement.id].getValue();
        }
        
        const formConfig = {
            type: formType,
            email: {
                recipient: document.getElementById('recipient-email')?.value || '',
                subject: document.getElementById('email-subject')?.value || ''
            },
            autoresponder: {
                code: autoresponderCodeValue,
                parsedData: this.parsedFormData || null
            },
            googleForm: {
                url: document.getElementById('google-form-url')?.value || '',
                height: document.getElementById('google-form-height')?.value || '600'
            },
            custom: {
                fields: this.collectCustomFields()
            }
        };
        this.websiteData.form_config = formConfig;
    }

    // Update Main Website
    updateMainWebsite() {
        // This would typically send data to a backend
        // For now, we'll use localStorage and the main page can read from it
        console.log('Website data updated:', this.websiteData);
    }

    // Preview Functions
    showPreview() {
        // Use the exact same approach as theme preview but with current settings
        const modal = document.getElementById('theme-preview-modal');
        const iframe = document.getElementById('theme-preview-iframe');
        
        if (modal && iframe) {
            // Collect current form data first
            this.collectFormData();
            
            // Create a copy of website data with current settings (no theme change)
            const previewData = JSON.parse(JSON.stringify(this.websiteData));
            
            // Show modal
            modal.classList.add('active');
            
            // Send data to iframe after a short delay to ensure it's loaded
            setTimeout(() => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'UPDATE_WEBSITE',
                        data: previewData
                    }, '*');
                    console.log('Preview data sent:', previewData);
                }
            }, 500);
        }
    }

    closePreview() {
        document.getElementById('theme-preview-modal').classList.remove('active');
    }
    
    toggleScreenSize(size) {
        // Remove active class from all buttons
        document.querySelectorAll('.screen-size-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        const activeBtn = document.querySelector(`[data-size="${size}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update preview containers
        const previewContainers = document.querySelectorAll('.preview-container');
        previewContainers.forEach(container => {
            container.className = `preview-container ${size}`;
        });
    }

    showCurrentThemePreview() {
        // Show preview with current settings
        const modal = document.getElementById('preview-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.updatePreviewIframe();
        }
    }

    showThemePreviewLightbox() {
        // Show theme preview in lightbox modal
        const modal = document.getElementById('theme-preview-modal');
        if (modal) {
            modal.classList.add('active');
            const iframe = document.getElementById('theme-preview-iframe');
            if (iframe) {
                iframe.src = 'index.html';
                // Send current data to iframe after load
                setTimeout(() => {
                    if (iframe.contentWindow) {
                        iframe.contentWindow.postMessage({
                            type: 'UPDATE_WEBSITE',
                            data: this.websiteData
                        }, '*');
                    }
                }, 500);
            }
        }
    }

    // Navigation Setup
    setupNavigation() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash) {
                this.switchSection(hash);
            }
        });

        // Set initial section
        const hash = window.location.hash.slice(1);
        if (hash) {
            this.switchSection(hash);
        }
    }

    // Utility Functions
    // Form Configuration Functions
    bindFormConfiguration() {
        const formTypeSelect = document.getElementById('form-type');
        if (formTypeSelect) {
            formTypeSelect.addEventListener('change', (e) => this.showFormConfig(e.target.value));
        }
        
        const parseAutoresponderBtn = document.getElementById('parse-autoresponder');
        if (parseAutoresponderBtn) {
            parseAutoresponderBtn.addEventListener('click', () => this.parseAutoresponderCode());
        }
        
        const addCustomFieldBtn = document.getElementById('add-custom-field');
        if (addCustomFieldBtn) {
            addCustomFieldBtn.addEventListener('click', () => this.addCustomField());
        }
        
        const saveFormConfigBtn = document.getElementById('save-form-config');
        if (saveFormConfigBtn) {
            saveFormConfigBtn.addEventListener('click', () => this.saveFormConfiguration());
        }
        
        // Load existing form configuration
        this.loadFormConfiguration();
    }
    
    showFormConfig(formType) {
        // Hide all config sections
        document.querySelectorAll('.form-config-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show selected config section
        const configSection = document.getElementById(`${formType}-config`);
        if (configSection) {
            configSection.style.display = 'block';
        }
    }
    
    parseAutoresponderCode() {
        const codeTextarea = document.getElementById('autoresponder-code');
        const code = codeTextarea.value;
        
        if (!code) {
            this.showMessage('Please paste autoresponder code first', 'error');
            return;
        }
        
        try {
            // Parse the code and extract form elements
            const parser = new DOMParser();
            const doc = parser.parseFromString(code, 'text/html');
            
            // Extract form action, method, and fields
            const form = doc.querySelector('form');
            if (!form) {
                this.showMessage('No form found in the code', 'error');
                return;
            }
            
            const formData = {
                action: form.getAttribute('action') || '',
                method: form.getAttribute('method') || 'POST',
                fields: []
            };
            
            // Extract input fields
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (input.type !== 'hidden' && input.name) {
                    formData.fields.push({
                        name: input.name,
                        type: input.type || 'text',
                        label: this.extractLabel(input),
                        required: input.hasAttribute('required'),
                        placeholder: input.placeholder || ''
                    });
                }
            });
            
            // Store parsed data
            this.parsedFormData = formData;
            
            this.showMessage('Autoresponder code parsed successfully!', 'success');
            console.log('Parsed form data:', formData);
            
        } catch (error) {
            this.showMessage('Error parsing autoresponder code: ' + error.message, 'error');
        }
    }
    
    extractLabel(input) {
        // Try to find associated label
        const id = input.getAttribute('id');
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) return label.textContent.trim();
        }
        
        // Try to find label as parent or sibling
        const parentLabel = input.closest('label');
        if (parentLabel) return parentLabel.textContent.trim();
        
        // Use name as fallback
        return input.name || 'Field';
    }
    
    addCustomField() {
        const fieldsList = document.getElementById('custom-fields-list');
        const fieldIndex = fieldsList.children.length;
        
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'custom-field-item';
        fieldDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Field Name</label>
                    <input type="text" class="field-name" placeholder="firstName" value="">
                </div>
                <div class="form-group">
                    <label>Field Type</label>
                    <select class="field-type">
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="textarea">Textarea</option>
                        <option value="select">Select</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Label</label>
                    <input type="text" class="field-label" placeholder="First Name" value="">
                </div>
                <div class="form-group">
                    <label>Required</label>
                    <input type="checkbox" class="field-required" checked>
                </div>
                <button type="button" class="btn-remove" onclick="this.parentElement.remove()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        fieldsList.appendChild(fieldDiv);
    }
    
    async saveFormConfiguration() {
        const formType = document.getElementById('form-type').value;
        const formConfig = {
            type: formType,
            email: {
                recipient: document.getElementById('recipient-email').value,
                subject: document.getElementById('email-subject').value
            },
            autoresponder: {
                code: document.getElementById('autoresponder-code').value,
                parsedData: this.parsedFormData || null
            },
            googleForm: {
                url: document.getElementById('google-form-url').value,
                height: document.getElementById('google-form-height').value
            },
            custom: {
                fields: this.collectCustomFields()
            }
        };
        
        try {
            // Save to Supabase
            const { error } = await this.supabase
                .from('website_content')
                .upsert({
                    section_name: 'form_config',
                    content: formConfig
                }, {
                    onConflict: 'section_name'
                });
            
            if (error) throw error;
            
            this.showMessage('Form configuration saved successfully!', 'success');
            
        } catch (error) {
            this.showMessage('Error saving form configuration: ' + error.message, 'error');
        }
    }
    
    collectCustomFields() {
        const fields = [];
        document.querySelectorAll('.custom-field-item').forEach(item => {
            fields.push({
                name: item.querySelector('.field-name').value,
                type: item.querySelector('.field-type').value,
                label: item.querySelector('.field-label').value,
                required: item.querySelector('.field-required').checked
            });
        });
        return fields;
    }
    
    loadFormConfiguration() {
        // Load existing form configuration from database
        if (this.websiteData.form_config) {
            const config = this.websiteData.form_config;
            
            document.getElementById('form-type').value = config.type || 'email';
            this.showFormConfig(config.type || 'email');
            
            if (config.email) {
                document.getElementById('recipient-email').value = config.email.recipient || '';
                document.getElementById('email-subject').value = config.email.subject || '';
            }
            
            if (config.autoresponder) {
                document.getElementById('autoresponder-code').value = config.autoresponder.code || '';
            }
            
            if (config.googleForm) {
                document.getElementById('google-form-url').value = config.googleForm.url || '';
                document.getElementById('google-form-height').value = config.googleForm.height || '600';
            }
            
            if (config.custom && config.custom.fields) {
                this.populateCustomFields(config.custom.fields);
            }
        }
    }
    
    populateCustomFields(fields) {
        const fieldsList = document.getElementById('custom-fields-list');
        fieldsList.innerHTML = '';
        
        fields.forEach(field => {
            this.addCustomField();
            const lastField = fieldsList.lastElementChild;
            lastField.querySelector('.field-name').value = field.name;
            lastField.querySelector('.field-type').value = field.type;
            lastField.querySelector('.field-label').value = field.label;
            lastField.querySelector('.field-required').checked = field.required;
        });
    }

    showMessage(message, type = 'success') {
        const container = document.getElementById('message-container');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
    
    // Cleanup advanced editors
    cleanupAdvancedEditors() {
        if (this.advancedEditors) {
            Object.values(this.advancedEditors).forEach(editor => {
                if (editor && typeof editor.destroy === 'function') {
                    editor.destroy();
                }
            });
            this.advancedEditors = {};
        }
    }
    
    // Enhanced Color Preview Handlers
    bindColorPreviewHandlers() {
        const colorInputs = [
            'primary-color', 'secondary-color', 'accent-color',
            'nav-bg-color', 'nav-text-color', 'nav-hover-color', 'nav-active-color'
        ];
        
        colorInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            const preview = document.getElementById(`${inputId}-preview`);
            const valueSpan = document.getElementById(`${inputId}-value`);
            const colorNameSpan = document.querySelector(`#${inputId}-preview`).parentNode.querySelector('.color-name');
            const colorHexSpan = document.querySelector(`#${inputId}-preview`).parentNode.querySelector('.color-hex');
            
            if (input && preview && valueSpan) {
                // Set initial color
                const initialColor = input.value;
                preview.style.backgroundColor = initialColor;
                valueSpan.textContent = initialColor;
                
                // Update color info
                if (colorNameSpan) {
                    colorNameSpan.textContent = this.getColorName(initialColor);
                }
                if (colorHexSpan) {
                    colorHexSpan.textContent = initialColor;
                }
                
                // Update on change
                input.addEventListener('input', (e) => {
                    const color = e.target.value;
                    preview.style.backgroundColor = color;
                    valueSpan.textContent = color;
                    
                    // Update color info
                    if (colorNameSpan) {
                        colorNameSpan.textContent = this.getColorName(color);
                    }
                    if (colorHexSpan) {
                        colorHexSpan.textContent = color;
                    }
                });
            }
        });
    }

    getColorName(hexColor) {
        const colorMap = {
            '#1e40af': 'Dark Blue',
            '#ea580c': 'Orange',
            '#3b82f6': 'Blue',
            '#1a1a1a': 'Dark Gray',
            '#ffffff': 'White',
            '#ffd700': 'Gold',
            '#6a5acd': 'Purple',
            '#8e6ee6': 'Light Purple',
            '#ffa726': 'Orange',
            '#4caf50': 'Green',
            '#f44336': 'Red',
            '#ff9800': 'Orange'
        };
        
        return colorMap[hexColor.toLowerCase()] || 'Custom';
    }
    
    // Theme Preview Handlers
    bindThemePreviewHandlers() {
        const themePreviewModal = document.getElementById('theme-preview-modal');
        const themePreviewClose = document.getElementById('theme-preview-close');
        const themePreviewIframe = document.getElementById('theme-preview-iframe');
        
        // Handle individual theme preview buttons
        const themePreviewBtns = document.querySelectorAll('.theme-preview-btn');
        themePreviewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const theme = btn.getAttribute('data-theme');
                this.showThemePreview(theme);
            });
        });
        
        if (themePreviewClose) {
            themePreviewClose.addEventListener('click', () => {
                this.closeThemePreview();
            });
        }
        
        // Also handle escape key for theme preview
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const themeModal = document.getElementById('theme-preview-modal');
                if (themeModal && themeModal.classList.contains('active')) {
                    this.closeThemePreview();
                }
            }
        });
        
        // Close modal on outside click
        if (themePreviewModal) {
            themePreviewModal.addEventListener('click', (e) => {
                if (e.target === themePreviewModal) {
                    this.closeThemePreview();
                }
            });
        }
    }
    
    showThemePreview(theme = null) {
        const modal = document.getElementById('theme-preview-modal');
        const iframe = document.getElementById('theme-preview-iframe');
        
        if (modal && iframe) {
            // Collect current form data first
            this.collectFormData();
            
            // Create a copy of website data with the specific theme
            const previewData = JSON.parse(JSON.stringify(this.websiteData));
            
            // Set the specific theme
            if (!previewData.settings) previewData.settings = {};
            previewData.settings.theme = theme || 'modern';
            
            // Update colors based on theme
            const themeColors = this.getThemeColors(theme || 'modern');
            if (previewData.settings) {
                previewData.settings.primaryColor = themeColors.primary;
                previewData.settings.secondaryColor = themeColors.secondary;
                previewData.settings.accentColor = themeColors.accent;
            }
            
            // Show modal
            modal.classList.add('active');
            
            // Send data to iframe after a short delay to ensure it's loaded
            setTimeout(() => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'UPDATE_WEBSITE',
                        data: previewData
                    }, '*');
                    console.log('Theme preview data sent:', previewData);
                }
            }, 500);
        }
    }
    
    getThemeColors(theme) {
        const themes = {
            'modern': {
                primary: '#6a5acd',
                secondary: '#8e6ee6',
                accent: '#ffa726'
            },
            'elegant': {
                primary: '#2c3e50',
                secondary: '#34495e',
                accent: '#e74c3c'
            },
            'creative': {
                primary: '#e91e63',
                secondary: '#9c27b0',
                accent: '#ff9800'
            },
            'minimal': {
                primary: '#333333',
                secondary: '#666666',
                accent: '#999999'
            },
            'corporate': {
                primary: '#1976d2',
                secondary: '#424242',
                accent: '#ff5722'
            }
        };
        
        return themes[theme] || themes.modern;
    }
    
    closeThemePreview() {
        const modal = document.getElementById('theme-preview-modal');
        if (modal) {
            modal.classList.remove('active');
            console.log('Theme preview modal closed');
        }
    }
    
    // Global Font Set Handlers
    bindGlobalFontSetHandlers() {
        const fontSetSelect = document.getElementById('global-font-set');
        
        if (fontSetSelect) {
            fontSetSelect.addEventListener('change', (e) => {
                this.updateGlobalFontSet(e.target.value);
            });
            
            // Set initial value
            if (this.websiteData.settings?.globalFontSet) {
                fontSetSelect.value = this.websiteData.settings.globalFontSet;
            }
        }
    }
    
    updateGlobalFontSet(fontSet) {
        // Update the settings
        if (!this.websiteData.settings) this.websiteData.settings = {};
        this.websiteData.settings.globalFontSet = fontSet;
        
        // Load appropriate fonts based on selection
        this.loadFontSet(fontSet);
        
        // Show preview of the font set
        this.showFontSetPreview(fontSet);
    }
    
    loadFontSet(fontSet) {
        const fontLinks = {
            'professional': [
                'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap'
            ],
            'futuristic': [
                'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Rajdhani:wght@400;500;600&display=swap'
            ],
            'minimalist': [
                'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Source+Sans+Pro:wght@300;400;600&display=swap'
            ],
            'scrapbook': [
                'https://fonts.googleapis.com/css2?family=Indie+Flower&family=Caveat:wght@400;500;600;700&display=swap'
            ],
            'impactful': [
                'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Impact&display=swap'
            ]
        };
        
        if (fontLinks[fontSet]) {
            fontLinks[fontSet].forEach(link => {
                this.loadGoogleFont(link);
            });
        }
    }
    
    loadGoogleFont(link) {
        // Check if font is already loaded
        if (!document.querySelector(`link[href="${link}"]`)) {
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = link;
            document.head.appendChild(linkElement);
        }
    }
    
    showFontSetPreview(fontSet) {
        const descriptions = {
            'anwesh-default': 'Current default font selection',
            'professional': 'Clean, modern fonts perfect for business and professional websites',
            'futuristic': 'Bold, tech-inspired fonts for cutting-edge designs',
            'minimalist': 'Lightweight, clean fonts for minimal and elegant designs',
            'scrapbook': 'Handwritten, creative fonts for personal and artistic websites',
            'impactful': 'Strong, bold fonts that make a powerful statement'
        };
        
        // You can add a preview element to show the font set
        console.log(`Font set changed to: ${fontSet} - ${descriptions[fontSet]}`);
    }
    
    // Navigation Color Settings
    bindNavigationColorHandlers() {
        const navColorMode = document.getElementById('nav-color-mode');
        const navCustomColors = document.getElementById('nav-custom-colors');
        const navLightColors = document.getElementById('nav-light-colors');
        const navInvertColors = document.getElementById('nav-invert-colors');
        
        if (navColorMode) {
            navColorMode.addEventListener('change', (e) => {
                this.updateNavigationColorMode(e.target.value);
            });
            
            // Set initial value
            if (this.websiteData.settings?.navColorMode) {
                navColorMode.value = this.websiteData.settings.navColorMode;
                this.updateNavigationColorMode(this.websiteData.settings.navColorMode);
            }
        }
        
        if (navCustomColors && navLightColors) {
            // Show/hide color sections based on mode
            navColorMode?.addEventListener('change', (e) => {
                const mode = e.target.value;
                navCustomColors.style.display = 'none';
                navLightColors.style.display = 'none';
                
                if (mode === 'custom') {
                    navCustomColors.style.display = 'block';
                    navLightColors.style.display = 'block';
                }
            });
            
            // Initialize custom color inputs
            this.bindCustomColorHandlers();
            this.bindLightColorHandlers();
        }
        
        if (navInvertColors) {
            navInvertColors.addEventListener('change', (e) => {
                this.updateNavigationInvert(e.target.checked);
            });
            
            // Set initial value
            if (this.websiteData.settings?.navInvertColors !== undefined) {
                navInvertColors.checked = this.websiteData.settings.navInvertColors;
            }
        }
    }
    
    bindCustomColorHandlers() {
        const colorInputs = ['nav-bg-color', 'nav-text-color', 'nav-hover-color', 'nav-active-color'];
        
        colorInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            const preview = document.getElementById(`${inputId}-preview`);
            const valueSpan = document.getElementById(`${inputId}-value`);
            
            if (input && preview && valueSpan) {
                // Set initial color
                preview.style.backgroundColor = input.value;
                valueSpan.textContent = input.value;
                
                // Update on change
                input.addEventListener('input', (e) => {
                    const color = e.target.value;
                    preview.style.backgroundColor = color;
                    valueSpan.textContent = color;
                    this.updateNavigationCustomColors();
                });
            }
        });
    }
    
    bindLightColorHandlers() {
        const colorInputs = ['nav-bg-color-light', 'nav-text-color-light', 'nav-hover-color-light', 'nav-active-color-light'];
        
        colorInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            const preview = document.getElementById(`${inputId}-preview`);
            const valueSpan = document.getElementById(`${inputId}-value`);
            
            if (input && preview && valueSpan) {
                // Set initial color
                preview.style.backgroundColor = input.value;
                valueSpan.textContent = input.value;
                
                // Update on change
                input.addEventListener('input', (e) => {
                    const color = e.target.value;
                    preview.style.backgroundColor = color;
                    valueSpan.textContent = color;
                    this.updateNavigationCustomColors();
                });
            }
        });
    }
    
    updateNavigationColorMode(mode) {
        // Update the settings
        if (!this.websiteData.settings) this.websiteData.settings = {};
        this.websiteData.settings.navColorMode = mode;
        
        // Apply the color mode
        this.applyNavigationColorMode(mode);
        
        console.log(`Navigation color mode changed to: ${mode}`);
    }
    
    applyNavigationColorMode(mode) {
        const sidebar = document.querySelector('.admin-sidebar');
        if (!sidebar) return;
        
        // Remove existing color classes
        sidebar.classList.remove('nav-invert-dark', 'nav-invert-light');
        
        switch (mode) {
            case 'auto':
                // Auto follows the current theme
                if (document.body.classList.contains('dark-mode')) {
                    sidebar.classList.add('nav-invert-dark');
                } else {
                    sidebar.classList.add('nav-invert-light');
                }
                break;
            case 'dark':
                sidebar.classList.add('nav-invert-dark');
                break;
            case 'light':
                sidebar.classList.add('nav-invert-light');
                break;
            case 'custom':
                this.applyNavigationCustomColors();
                break;
        }
    }
    
    updateNavigationCustomColors() {
        const bgColor = document.getElementById('nav-bg-color')?.value || '#1a1a1a';
        const textColor = document.getElementById('nav-text-color')?.value || '#ffffff';
        const hoverColor = document.getElementById('nav-hover-color')?.value || '#ffd700';
        const activeColor = document.getElementById('nav-active-color')?.value || '#ffd700';
        
        // Apply custom colors via CSS variables
        document.documentElement.style.setProperty('--nav-bg-color', bgColor);
        document.documentElement.style.setProperty('--nav-text-color', textColor);
        document.documentElement.style.setProperty('--nav-hover-color', hoverColor);
        document.documentElement.style.setProperty('--nav-active-color', activeColor);
        
        // Update settings
        if (!this.websiteData.settings) this.websiteData.settings = {};
        this.websiteData.settings.navCustomColors = {
            bg: bgColor,
            text: textColor,
            hover: hoverColor,
            active: activeColor
        };
    }
    
    applyNavigationCustomColors() {
        const sidebar = document.querySelector('.admin-sidebar');
        if (!sidebar) return;
        
        // Remove existing color classes
        sidebar.classList.remove('nav-invert-dark', 'nav-invert-light');
        
        // Apply custom colors
        this.updateNavigationCustomColors();
    }
    
    updateNavigationInvert(invert) {
        // Update the settings
        if (!this.websiteData.settings) this.websiteData.settings = {};
        this.websiteData.settings.navInvertColors = invert;
        
        // Apply inversion
        this.applyNavigationInvert(invert);
        
        console.log(`Navigation color inversion: ${invert}`);
    }
    
    applyNavigationInvert(invert) {
        const sidebar = document.querySelector('.admin-sidebar');
        if (!sidebar) return;
        
        if (invert) {
            // Invert the current colors
            if (document.body.classList.contains('dark-mode')) {
                sidebar.classList.remove('nav-invert-dark');
                sidebar.classList.add('nav-invert-light');
            } else {
                sidebar.classList.remove('nav-invert-light');
                sidebar.classList.add('nav-invert-dark');
            }
        } else {
            // Reset to normal
            this.applyNavigationColorMode(this.websiteData.settings?.navColorMode || 'auto');
        }
    }
}

// Initialize Admin Panel
console.log('About to create AdminPanel instance...');
const adminPanel = new AdminPanel();
console.log('AdminPanel instance created:', adminPanel);

// Handle iframe messages
window.addEventListener('message', (event) => {
    if (event.data.type === 'REQUEST_WEBSITE_DATA') {
        event.source.postMessage({
            type: 'WEBSITE_DATA',
            data: adminPanel.websiteData
        }, '*');
    }
});

// Test debug console immediately
setTimeout(() => {
    if (adminPanel && typeof adminPanel.logToDebug === 'function') {
        adminPanel.logToDebug('Debug console test - this should appear!', 'success');
    } else {
        console.error('AdminPanel or logToDebug not available');
    }
}, 1000); 