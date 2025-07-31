-- =====================================================
-- SUPERADMIN DATABASE SCHEMA - FIXED VERSION
-- Multi-Tenant SaaS Platform for Portfolio Websites
-- This version checks for existing tables before creating them
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

-- Super Admin Users
CREATE TABLE IF NOT EXISTS super_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'super_admin',
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform Users (Customers) - Only create if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            company_name VARCHAR(200),
            phone VARCHAR(20),
            country VARCHAR(100),
            timezone VARCHAR(50) DEFAULT 'UTC',
            avatar_url TEXT,
            preferences JSONB DEFAULT '{}',
            is_active BOOLEAN DEFAULT true,
            is_verified BOOLEAN DEFAULT false,
            email_verified_at TIMESTAMP,
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUBSCRIPTIONS & BILLING
-- =====================================================

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    features JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, suspended, expired
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing History
CREATE TABLE IF NOT EXISTS billing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL, -- paid, pending, failed, refunded
    stripe_invoice_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TEMPLATES & SITE MANAGEMENT
-- =====================================================

-- Website Templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- professional, creative, tech, service, personal
    preview_image_url TEXT,
    thumbnail_url TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    html_template TEXT,
    css_template TEXT,
    js_template TEXT,
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Websites - Only create if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_sites') THEN
        CREATE TABLE user_sites (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            template_id UUID REFERENCES templates(id),
            name VARCHAR(200) NOT NULL,
            slug VARCHAR(200) UNIQUE NOT NULL,
            custom_domain VARCHAR(255),
            title VARCHAR(200),
            description TEXT,
            keywords TEXT,
            content JSONB NOT NULL DEFAULT '{}',
            settings JSONB NOT NULL DEFAULT '{}',
            theme JSONB NOT NULL DEFAULT '{}',
            navigation JSONB NOT NULL DEFAULT '{}',
            scripts JSONB NOT NULL DEFAULT '[]',
            is_active BOOLEAN DEFAULT true,
            is_published BOOLEAN DEFAULT false,
            published_at TIMESTAMP,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- Site Analytics
CREATE TABLE IF NOT EXISTS site_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES user_sites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2),
    avg_session_duration INTEGER, -- in seconds
    top_pages JSONB DEFAULT '[]',
    traffic_sources JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- LEGAL & COMPLIANCE
-- =====================================================

-- Legal Pages
CREATE TABLE IF NOT EXISTS legal_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES user_sites(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- privacy, terms, disclaimer, contact, cookies
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legal Templates
CREATE TABLE IF NOT EXISTS legal_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- AI & CHATBOT
-- =====================================================

-- AI Chatbot Configurations
CREATE TABLE IF NOT EXISTS ai_chatbots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES user_sites(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}',
    training_data JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chatbot Conversations
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatbot_id UUID REFERENCES ai_chatbots(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    user_message TEXT,
    bot_response TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SOCIAL MEDIA & INTEGRATIONS
-- =====================================================

-- Social Media Accounts
CREATE TABLE IF NOT EXISTS social_media_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- linkedin, twitter, instagram, facebook
    account_name VARCHAR(200),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social Media Posts
CREATE TABLE IF NOT EXISTS social_media_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES social_media_accounts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    scheduled_at TIMESTAMP,
    posted_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, posted, failed
    platform_post_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NOTIFICATIONS & SUPPORT
-- =====================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- email, push, in_app
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
    category VARCHAR(50), -- billing, technical, feature_request, general
    assigned_to UUID REFERENCES super_admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Messages
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID, -- Can be user_id or super_admin_id
    sender_type VARCHAR(20) NOT NULL, -- user, admin
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PLATFORM ANALYTICS & LOGS
-- =====================================================

-- Platform Analytics
CREATE TABLE IF NOT EXISTS platform_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_sites INTEGER DEFAULT 0,
    active_sites INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    new_signups INTEGER DEFAULT 0,
    churn_rate DECIMAL(5,2),
    avg_session_duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Logs
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL, -- info, warning, error, critical
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_email') THEN
        CREATE INDEX idx_users_email ON users(email);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_created_at') THEN
        CREATE INDEX idx_users_created_at ON users(created_at);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_is_active') THEN
        CREATE INDEX idx_users_is_active ON users(is_active);
    END IF;
END $$;

-- Subscriptions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_subscriptions_user_id') THEN
        CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_subscriptions_status') THEN
        CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_subscriptions_stripe_id') THEN
        CREATE INDEX idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
    END IF;
END $$;

-- Sites
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sites_user_id') THEN
        CREATE INDEX idx_user_sites_user_id ON user_sites(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sites_slug') THEN
        CREATE INDEX idx_user_sites_slug ON user_sites(slug);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sites_custom_domain') THEN
        CREATE INDEX idx_user_sites_custom_domain ON user_sites(custom_domain);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sites_is_active') THEN
        CREATE INDEX idx_user_sites_is_active ON user_sites(is_active);
    END IF;
END $$;

-- Analytics
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_site_analytics_site_id') THEN
        CREATE INDEX idx_site_analytics_site_id ON site_analytics(site_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_site_analytics_date') THEN
        CREATE INDEX idx_site_analytics_date ON site_analytics(date);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_platform_analytics_date') THEN
        CREATE INDEX idx_platform_analytics_date ON platform_analytics(date);
    END IF;
END $$;

-- Social Media
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_social_media_user_id') THEN
        CREATE INDEX idx_social_media_user_id ON social_media_accounts(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_social_media_posts_user_id') THEN
        CREATE INDEX idx_social_media_posts_user_id ON social_media_posts(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_social_media_posts_scheduled_at') THEN
        CREATE INDEX idx_social_media_posts_scheduled_at ON social_media_posts(scheduled_at);
    END IF;
END $$;

-- Support
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_support_tickets_user_id') THEN
        CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_support_tickets_status') THEN
        CREATE INDEX idx_support_tickets_status ON support_tickets(status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_support_tickets_priority') THEN
        CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
    END IF;
END $$;

-- Logs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_system_logs_level') THEN
        CREATE INDEX idx_system_logs_level ON system_logs(level);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_system_logs_created_at') THEN
        CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
    END IF;
END $$;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at (only if triggers don't exist)
DO $$
DECLARE
    table_name text;
    trigger_name text;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY['users', 'user_subscriptions', 'subscription_plans', 'templates', 'user_sites', 'legal_pages', 'legal_templates', 'ai_chatbots', 'social_media_accounts', 'social_media_posts', 'support_tickets'])
    LOOP
        trigger_name := 'update_' || table_name || '_updated_at';
        
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = trigger_name) THEN
            EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', trigger_name, table_name);
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- SAMPLE DATA INSERTION (Only if not exists)
-- =====================================================

-- Insert default super admin (only if not exists)
INSERT INTO super_admins (username, email, password_hash, first_name, last_name) 
SELECT 'superadmin', 'admin@soumitaspace.com', '$2b$10$demo_hash_for_superadmin', 'Super', 'Admin'
WHERE NOT EXISTS (SELECT 1 FROM super_admins WHERE username = 'superadmin');

-- Insert default subscription plans (only if not exists)
INSERT INTO subscription_plans (name, slug, description, price, billing_cycle, features, limits) 
SELECT 'Free', 'free', 'Basic portfolio with limited features', 0.00, 'monthly', 
       '{"templates": 1, "storage": "5MB", "analytics": false, "custom_domain": false, "ai_features": false}', 
       '{"sites": 1, "pages": 1, "storage_mb": 5}'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE slug = 'free');

INSERT INTO subscription_plans (name, slug, description, price, billing_cycle, features, limits) 
SELECT 'Starter', 'starter', 'Professional portfolio with advanced features', 9.00, 'monthly',
       '{"templates": 3, "storage": "50MB", "analytics": true, "custom_domain": true, "ai_features": false}',
       '{"sites": 1, "pages": 3, "storage_mb": 50}'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE slug = 'starter');

INSERT INTO subscription_plans (name, slug, description, price, billing_cycle, features, limits) 
SELECT 'Professional', 'professional', 'Advanced features with AI integration', 19.00, 'monthly',
       '{"templates": "all", "storage": "500MB", "analytics": true, "custom_domain": true, "ai_features": true}',
       '{"sites": 3, "pages": 10, "storage_mb": 500}'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE slug = 'professional');

INSERT INTO subscription_plans (name, slug, description, price, billing_cycle, features, limits) 
SELECT 'Enterprise', 'enterprise', 'White-label solution with API access', 49.00, 'monthly',
       '{"templates": "all", "storage": "5GB", "analytics": true, "custom_domain": true, "ai_features": true, "api_access": true}',
       '{"sites": "unlimited", "pages": "unlimited", "storage_mb": 5120}'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE slug = 'enterprise');

-- Insert sample templates (only if not exists)
INSERT INTO templates (name, slug, description, category, is_active, sort_order) 
SELECT 'Professional', 'professional', 'Clean and modern professional portfolio', 'professional', true, 1
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE slug = 'professional');

INSERT INTO templates (name, slug, description, category, is_active, sort_order) 
SELECT 'Creative', 'creative', 'Bold and artistic creative portfolio', 'creative', true, 2
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE slug = 'creative');

INSERT INTO templates (name, slug, description, category, is_active, sort_order) 
SELECT 'Tech', 'tech', 'Developer and tech-focused portfolio', 'tech', true, 3
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE slug = 'tech');

INSERT INTO templates (name, slug, description, category, is_active, sort_order) 
SELECT 'Service', 'service', 'Service-based business portfolio', 'service', true, 4
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE slug = 'service');

INSERT INTO templates (name, slug, description, category, is_active, sort_order) 
SELECT 'Personal', 'personal', 'Personal blog and lifestyle portfolio', 'personal', true, 5
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE slug = 'personal');

-- Insert sample legal templates (only if not exists)
INSERT INTO legal_templates (type, name, description, content, variables) 
SELECT 'privacy', 'Standard Privacy Policy', 'Basic privacy policy template', 
       'This Privacy Policy describes how we collect, use, and protect your information...', 
       '{"company_name": "", "website_url": "", "contact_email": ""}'
WHERE NOT EXISTS (SELECT 1 FROM legal_templates WHERE type = 'privacy' AND name = 'Standard Privacy Policy');

INSERT INTO legal_templates (type, name, description, content, variables) 
SELECT 'terms', 'Standard Terms of Service', 'Basic terms of service template',
       'These Terms of Service govern your use of our website...',
       '{"company_name": "", "website_url": "", "contact_email": ""}'
WHERE NOT EXISTS (SELECT 1 FROM legal_templates WHERE type = 'terms' AND name = 'Standard Terms of Service');

INSERT INTO legal_templates (type, name, description, content, variables) 
SELECT 'disclaimer', 'Standard Disclaimer', 'Basic disclaimer template',
       'The information provided on this website is for general informational purposes only...',
       '{"company_name": "", "website_url": ""}'
WHERE NOT EXISTS (SELECT 1 FROM legal_templates WHERE type = 'disclaimer' AND name = 'Standard Disclaimer');

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables (only if not already enabled)
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY['users', 'user_subscriptions', 'user_sites', 'social_media_accounts', 'support_tickets'])
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    END LOOP;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own data" ON users;
    DROP POLICY IF EXISTS "Users can update own data" ON users;
    DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
    DROP POLICY IF EXISTS "Users can update own subscriptions" ON user_subscriptions;
    DROP POLICY IF EXISTS "Users can view own sites" ON user_sites;
    DROP POLICY IF EXISTS "Users can insert own sites" ON user_sites;
    DROP POLICY IF EXISTS "Users can update own sites" ON user_sites;
    DROP POLICY IF EXISTS "Users can delete own sites" ON user_sites;
    DROP POLICY IF EXISTS "Users can view own social accounts" ON social_media_accounts;
    DROP POLICY IF EXISTS "Users can manage own social accounts" ON social_media_accounts;
    DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Users can create own tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Users can update own tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Super admins have full access" ON users;
END $$;

-- Create new policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sites" ON user_sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sites" ON user_sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sites" ON user_sites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sites" ON user_sites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own social accounts" ON social_media_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own social accounts" ON social_media_accounts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Super admins have full access" ON users FOR ALL USING (EXISTS (
    SELECT 1 FROM super_admins WHERE id = auth.uid()
));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE super_admins IS 'Super admin users who manage the platform';
COMMENT ON TABLE users IS 'Platform customers who create portfolio sites';
COMMENT ON TABLE subscription_plans IS 'Available subscription plans and pricing';
COMMENT ON TABLE user_subscriptions IS 'User subscription status and billing info';
COMMENT ON TABLE templates IS 'Available website templates';
COMMENT ON TABLE user_sites IS 'User-created portfolio websites';
COMMENT ON TABLE ai_chatbots IS 'AI chatbot configurations for user sites';
COMMENT ON TABLE social_media_accounts IS 'Connected social media accounts for syndication';
COMMENT ON TABLE support_tickets IS 'Customer support tickets';
COMMENT ON TABLE platform_analytics IS 'Platform-wide analytics and metrics';

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Success message
SELECT '✅ Super Admin Database Schema successfully created/updated!' as status; 