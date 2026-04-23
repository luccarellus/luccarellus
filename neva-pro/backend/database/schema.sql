-- Database Schema for ENEM Gamification System
-- Optimized for PostgreSQL

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------
-- TABLE: users
-- -----------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_total_xp ON users(total_xp DESC);
CREATE INDEX idx_users_email ON users(email);

-- -----------------------------------------------------
-- TABLE: questions
-- -----------------------------------------------------
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    explanation TEXT,
    subject VARCHAR(100) NOT NULL, -- e.g., Matitica, Linguagens
    difficulty VARCHAR(20) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_subject ON questions(subject);

-- -----------------------------------------------------
-- TABLE: question_options
-- -----------------------------------------------------
CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    label CHAR(1) NOT NULL -- A, B, C, D, E
);

CREATE INDEX idx_options_question_id ON question_options(question_id);

-- -----------------------------------------------------
-- TABLE: answers
-- -----------------------------------------------------
CREATE TABLE answers (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    option_id UUID REFERENCES question_options(id),
    is_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_created_at ON answers(created_at);

-- -----------------------------------------------------
-- TABLE: simulados
-- -----------------------------------------------------
CREATE TABLE simulados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- TABLE: simulado_questions
-- -----------------------------------------------------
CREATE TABLE simulado_questions (
    simulado_id UUID REFERENCES simulados(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    PRIMARY KEY (simulado_id, question_id)
);

-- -----------------------------------------------------
-- TABLE: materials
-- -----------------------------------------------------
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content_url TEXT NOT NULL,
    type VARCHAR(20) NOT NULL, -- VIDEO, PDF, ARTICLE
    subject VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- TABLE: xp_logs (Event Store for XP)
-- -----------------------------------------------------
CREATE TABLE xp_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL, -- e.g., 'QUESTION_CORRECT', 'SIMULADO_COMPLETE'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_xp_logs_user_id ON xp_logs(user_id);

-- -----------------------------------------------------
-- TABLE: badges
-- -----------------------------------------------------
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT NOT NULL,
    requirement_type VARCHAR(50), -- e.g., 'QUESTOES_RESPONDIDAS'
    requirement_value INTEGER
);

-- -----------------------------------------------------
-- TABLE: user_badges
-- -----------------------------------------------------
CREATE TABLE user_badges (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);

-- -----------------------------------------------------
-- TABLE: mural (Notifications)
-- -----------------------------------------------------
CREATE TABLE mural (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'INFO', -- INFO, WARNING, SUCCESS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
