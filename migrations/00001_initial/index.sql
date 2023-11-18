-- Bookmarks
-- This table contains all the bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    tag VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);