-- =====================================================
-- SUPERADMIN DATABASE SCHEMA
-- Multi-Tenant SaaS Platform for Portfolio Websites
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

-- Super Admin Users
CREATE TABLE super_admins (
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

-- Platform Users (Customers)
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

-- User Sessions
CREATE TABLE user_sessions (
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
CREATE TABLE subscription_plans (
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
CREATE TABLE user_subscriptions (
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
CREATE TABLE billing_history (
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
CREATE TABLE templates (
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

-- User Websites
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

-- Site Analytics
CREATE TABLE site_analytics (
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
CREATE TABLE legal_pages (
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
CREATE TABLE legal_templates (
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
CREATE TABLE ai_chatbots (
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
CREATE TABLE chatbot_conversations (
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
CREATE TABLE social_media_accounts (
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
CREATE TABLE social_media_posts (
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
CREATE TABLE notifications (
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
CREATE TABLE support_tickets (
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
CREATE TABLE ticket_messages (
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
CREATE TABLE platform_analytics (
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
CREATE TABLE system_logs (
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Subscriptions
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);

-- Sites
CREATE INDEX idx_user_sites_user_id ON user_sites(user_id);
CREATE INDEX idx_user_sites_slug ON user_sites(slug);
CREATE INDEX idx_user_sites_custom_domain ON user_sites(custom_domain);
CREATE INDEX idx_user_sites_is_active ON user_sites(is_active);

-- Analytics
CREATE INDEX idx_site_analytics_site_id ON site_analytics(site_id);
CREATE INDEX idx_site_analytics_date ON site_analytics(date);
CREATE INDEX idx_platform_analytics_date ON platform_analytics(date);

-- Social Media
CREATE INDEX idx_social_media_user_id ON social_media_accounts(user_id);
CREATE INDEX idx_social_media_posts_user_id ON social_media_posts(user_id);
CREATE INDEX idx_social_media_posts_scheduled_at ON social_media_posts(scheduled_at);

-- Support
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);

-- Logs
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

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

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sites_updated_at BEFORE UPDATE ON user_sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_legal_pages_updated_at BEFORE UPDATE ON legal_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_legal_templates_updated_at BEFORE UPDATE ON legal_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_chatbots_updated_at BEFORE UPDATE ON ai_chatbots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_accounts_updated_at BEFORE UPDATE ON social_media_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_posts_updated_at BEFORE UPDATE ON social_media_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert default super admin
INSERT INTO super_admins (username, email, password_hash, first_name, last_name) 
VALUES ('superadmin', 'admin@soumitaspace.com', '$2b$10$demo_hash_for_superadmin', 'Super', 'Admin');

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price, billing_cycle, features, limits) VALUES
('Free', 'free', 'Basic portfolio with limited features', 0.00, 'monthly', 
 '{"templates": 1, "storage": "5MB", "analytics": false, "custom_domain": false, "ai_features": false}', 
 '{"sites": 1, "pages": 1, "storage_mb": 5}'),
('Starter', 'starter', 'Professional portfolio with advanced features', 9.00, 'monthly',
 '{"templates": 3, "storage": "50MB", "analytics": true, "custom_domain": true, "ai_features": false}',
 '{"sites": 1, "pages": 3, "storage_mb": 50}'),
('Professional', 'professional', 'Advanced features with AI integration', 19.00, 'monthly',
 '{"templates": "all", "storage": "500MB", "analytics": true, "custom_domain": true, "ai_features": true}',
 '{"sites": 3, "pages": 10, "storage_mb": 500}'),
('Enterprise', 'enterprise', 'White-label solution with API access', 49.00, 'monthly',
 '{"templates": "all", "storage": "5GB", "analytics": true, "custom_domain": true, "ai_features": true, "api_access": true}',
 '{"sites": "unlimited", "pages": "unlimited", "storage_mb": 5120}');

-- Insert sample templates
INSERT INTO templates (name, slug, description, category, is_active, sort_order) VALUES
('Professional', 'professional', 'Clean and modern professional portfolio', 'professional', true, 1),
('Creative', 'creative', 'Bold and artistic creative portfolio', 'creative', true, 2),
('Tech', 'tech', 'Developer and tech-focused portfolio', 'tech', true, 3),
('Service', 'service', 'Service-based business portfolio', 'service', true, 4),
('Personal', 'personal', 'Personal blog and lifestyle portfolio', 'personal', true, 5);

-- Insert sample legal templates
INSERT INTO legal_templates (type, name, description, content, variables) VALUES
('privacy', 'Standard Privacy Policy', 'Basic privacy policy template', 
 'This Privacy Policy describes how we collect, use, and protect your information...', 
 '{"company_name": "", "website_url": "", "contact_email": ""}'),
('terms', 'Standard Terms of Service', 'Basic terms of service template',
 'These Terms of Service govern your use of our website...',
 '{"company_name": "", "website_url": "", "contact_email": ""}'),
('disclaimer', 'Standard Disclaimer', 'Basic disclaimer template',
 'The information provided on this website is for general informational purposes only...',
 '{"company_name": "", "website_url": ""}');

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Sites
CREATE POLICY "Users can view own sites" ON user_sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sites" ON user_sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sites" ON user_sites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sites" ON user_sites FOR DELETE USING (auth.uid() = user_id);

-- Social Media
CREATE POLICY "Users can view own social accounts" ON social_media_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own social accounts" ON social_media_accounts FOR ALL USING (auth.uid() = user_id);

-- Support Tickets
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);

-- Super admins have full access
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