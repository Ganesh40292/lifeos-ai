-- ====================================================
-- LifeOS Complete Database Schema Setup (MySQL Workbench)
-- ====================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS lifeos_db;
USE lifeos_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    xp INT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    streak_days INT NOT NULL DEFAULT 0,
    last_active_date DATE,
    two_factor_secret VARCHAR(32),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id),
    KEY idx_users_email (email)
) ENGINE=InnoDB;

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    attended_classes INT NOT NULL DEFAULT 0,
    total_classes INT NOT NULL DEFAULT 0,
    credits INT NOT NULL DEFAULT 3,
    grade VARCHAR(5),
    PRIMARY KEY (id),
    CONSTRAINT fk_subjects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_subjects_user_id (user_id)
) ENGINE=InnoDB;

-- 3. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'TODO',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    PRIMARY KEY (id),
    CONSTRAINT fk_assignments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    KEY idx_assignments_user_id (user_id),
    KEY idx_assignments_subject_id (subject_id)
) ENGINE=InnoDB;

-- 4. Timetable Entries Table
CREATE TABLE IF NOT EXISTS timetable_entries (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    day_of_week VARCHAR(15) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_timetable_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_timetable_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    KEY idx_timetable_user_id (user_id),
    KEY idx_timetable_subject_id (subject_id)
) ENGINE=InnoDB;

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    date DATE NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_transactions_user_id (user_id),
    KEY idx_transactions_date (date)
) ENGINE=InnoDB;

-- 6. Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    category VARCHAR(50) NOT NULL,
    limit_amount DECIMAL(15, 2) NOT NULL,
    budget_month INT NOT NULL,
    budget_year INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_category_month_year (user_id, category, budget_month, budget_year),
    KEY idx_budgets_user_id (user_id)
) ENGINE=InnoDB;

-- 7. Savings Goals Table
CREATE TABLE IF NOT EXISTS savings_goals (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    target_date DATE NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_savings_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_savings_goals_user_id (user_id)
) ENGINE=InnoDB;

-- 8. Notes Table
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    folder VARCHAR(100) NOT NULL DEFAULT 'General',
    tags VARCHAR(255),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    file_path VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_notes_user_id (user_id)
) ENGINE=InnoDB;


-- 9. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    company VARCHAR(200) NOT NULL,
    position VARCHAR(200) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'WISHLIST',
    date_applied DATE,
    url VARCHAR(500),
    salary_range VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_job_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_job_applications_user_id (user_id)
) ENGINE=InnoDB;

-- 10. Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    company VARCHAR(200),
    position VARCHAR(200),
    email VARCHAR(150),
    phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_contacts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_contacts_user_id (user_id)
) ENGINE=InnoDB;

-- 11. Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(100) NOT NULL,
    duration_minutes INT NOT NULL,
    calories_burned INT,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_workouts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_workouts_user_id (user_id),
    KEY idx_workouts_date (date)
) ENGINE=InnoDB;

-- 12. Health Metrics Table
CREATE TABLE IF NOT EXISTS health_metrics (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    weight DECIMAL(5, 2),
    water_intake_glasses INT,
    sleep_hours DECIMAL(4, 2),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_health_metrics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_health_metrics_user_date (user_id, date),
    KEY idx_health_metrics_user_id (user_id)
) ENGINE=InnoDB;

-- 13. Focus Sessions Table
CREATE TABLE IF NOT EXISTS focus_sessions (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    duration_minutes INT NOT NULL,
    date DATE NOT NULL,
    completed TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_focus_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_focus_sessions_user_id (user_id)
) ENGINE=InnoDB;

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_notifications_user_id (user_id),
    KEY idx_notifications_user_unread (user_id, is_read)
) ENGINE=InnoDB;

-- 15. Habits Table
CREATE TABLE IF NOT EXISTS habits (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    streak_days INT NOT NULL DEFAULT 0,
    last_completed DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_habits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_habits_user_id (user_id)
) ENGINE=InnoDB;

-- 16. Habit Logs Table
CREATE TABLE IF NOT EXISTS habit_logs (
    id VARCHAR(36) NOT NULL,
    habit_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    completed TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_habit_logs_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE KEY uq_habit_logs_habit_date (habit_id, date),
    KEY idx_habit_logs_habit_id (habit_id),
    KEY idx_habit_logs_date (date)
) ENGINE=InnoDB;

-- 17. User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    device VARCHAR(255),
    ip_address VARCHAR(255),
    last_active TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_user_sessions_user_id (user_id)
) ENGINE=InnoDB;