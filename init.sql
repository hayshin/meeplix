-- PostgreSQL initialization script for Narrari game database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL,
    current_round INTEGER DEFAULT 1,
    leader_player_id UUID,
    association TEXT,
    round_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    max_players INTEGER DEFAULT 8
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    cards TEXT,
    is_connected BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_game_session_id ON players(game_session_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_players_connected ON players(is_connected);

-- Grant permissions to the narrari_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO narrari_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO narrari_user;