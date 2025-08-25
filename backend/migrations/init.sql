# PostgreSQL Migration Script
-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(500),
    author_name VARCHAR(100) NOT NULL,
    tags VARCHAR(500),
    category VARCHAR(100),
    featured BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_blog_posts_search 
ON blog_posts USING gin(to_tsvector('english', title || ' ' || content || ' ' || excerpt || ' ' || COALESCE(tags, '')));

-- Insert sample data
INSERT INTO blog_posts (title, slug, content, excerpt, author_name, tags, category, featured, published, published_at) VALUES
(
    'Understanding Compensatory Damages in an ADA Context',
    'understanding-compensatory-damages-ada-context-1234',
    '<p>In ADA cases, understanding what this mean when seeking both injunctive relief and compensatory damages under Title II cases providing specific case law and specific damages to which the plaintiff is entitled to where proper documentation is provided.</p><p>The Americans with Disabilities Act (ADA) provides several avenues for relief when violations occur. This comprehensive guide explores the nuances of compensatory damages within the framework of ADA litigation, particularly focusing on Title II cases and the documentation required to support damage claims.</p><p>When pursuing ADA violations, plaintiffs often seek both injunctive relief to remedy ongoing accessibility barriers and compensatory damages to address harm already suffered. Understanding the intersection of these remedies is crucial for effective advocacy.</p>',
    'In ADA cases, understanding what this mean when seeking both injunctive relief and compensatory damages under Title II cases providing specific case law and specific damages.',
    'Legal Expert',
    'ADA,Legal,Compensatory Damages,Accessibility',
    'Legal',
    true,
    true,
    '2024-01-15 10:00:00'
),
(
    'Web Accessibility Best Practices for 2024',
    'web-accessibility-best-practices-2024-5678',
    '<p>Web accessibility has become more important than ever in 2024. This comprehensive guide covers the latest WCAG 2.1 guidelines and emerging best practices that every web developer should know.</p><p>As digital experiences continue to evolve, ensuring that websites and applications are accessible to all users, including those with disabilities, is not just a legal requirement but a moral imperative. This article explores practical implementation strategies and tools that can help create more inclusive digital experiences.</p><p>From semantic HTML to proper color contrast ratios, we''ll cover everything you need to know to make your websites accessible to everyone.</p>',
    'Web accessibility has become more important than ever in 2024. This comprehensive guide covers the latest WCAG 2.1 guidelines and emerging best practices.',
    'Web Developer',
    'Accessibility,WCAG,Web Development,UX',
    'Technology',
    true,
    true,
    '2024-01-20 14:30:00'
),
(
    'The Impact of Digital Accessibility on Business Success',
    'digital-accessibility-business-success-9012',
    '<p>Digital accessibility isn''t just about compliance—it''s about creating better experiences for all users and driving business value. Research shows that accessible websites perform better across multiple metrics.</p><p>Companies that prioritize accessibility see improvements in SEO rankings, user engagement, and customer satisfaction. This article examines real-world case studies and provides actionable insights for business leaders looking to champion accessibility initiatives.</p><p>We''ll explore the business case for accessibility, from legal risk mitigation to market expansion opportunities.</p>',
    'Digital accessibility isn''t just about compliance—it''s about creating better experiences for all users and driving business value.',
    'Business Analyst',
    'Business,Accessibility,Digital Strategy,ROI',
    'Business',
    false,
    true,
    '2024-01-25 09:15:00'
);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

---