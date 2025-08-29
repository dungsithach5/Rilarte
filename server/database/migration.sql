-- Table: users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    onboarded BOOLEAN DEFAULT FALSE,
    gender VARCHAR(50),
    emailVerified DATETIME,
    image VARCHAR(255)
);

-- Table: posts
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(45),
    title TEXT,
    content TEXT,
    image_url VARCHAR(255),
    dominant_color VARCHAR(7),
    license_type VARCHAR(50),
    license_description TEXT,
    watermark_enabled BOOLEAN DEFAULT FALSE,
    watermark_text VARCHAR(100),
    watermark_position VARCHAR(20),
    download_protected BOOLEAN DEFAULT FALSE,
    allow_download BOOLEAN DEFAULT TRUE,
    copyright_owner_id INT,
    copyright_year INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: comments
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    content TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    parent_id INT,
    INDEX(user_id),
    INDEX(post_id),
    INDEX(parent_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id)
);

-- Table: comment_likes
CREATE TABLE comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_comment (user_id, comment_id),
    INDEX(user_id),
    INDEX(comment_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Table: likes
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(user_id),
    INDEX(post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Table: follows
CREATE TABLE follows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (follower_id, following_id),
    INDEX(follower_id),
    INDEX(following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: messages
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    file_url VARCHAR(255),
    file_name VARCHAR(255),
    file_size INT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    room_id VARCHAR(100) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(sender_id),
    INDEX(receiver_id),
    INDEX(room_id),
    INDEX(createdAt),
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: chat_rooms
CREATE TABLE chat_rooms (
    id VARCHAR(100) PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    last_message_id INT UNIQUE,
    last_message_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_users (user1_id, user2_id),
    INDEX(user1_id),
    INDEX(user2_id),
    INDEX(last_message_at),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (last_message_id) REFERENCES messages(id)
);

-- Table: notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50),
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    related_user_id INT,
    related_post_id INT,
    related_comment_id INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(user_id),
    INDEX(related_user_id),
    INDEX(related_post_id),
    INDEX(related_comment_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_user_id) REFERENCES users(id),
    FOREIGN KEY (related_post_id) REFERENCES posts(id),
    FOREIGN KEY (related_comment_id) REFERENCES comments(id)
);

-- Table: tags
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: post_tags
CREATE TABLE post_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    UNIQUE KEY unique_post_tag (post_id, tag_id),
    INDEX(post_id),
    INDEX(tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Table: related_posts
CREATE TABLE related_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    related_id INT NOT NULL,
    UNIQUE KEY unique_related (post_id, related_id),
    INDEX(post_id),
    INDEX(related_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (related_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Table: saved_posts
CREATE TABLE saved_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_post (user_id, post_id),
    INDEX(user_id),
    INDEX(post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Table: report_posts
CREATE TABLE report_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    reporter_id INT NOT NULL,
    reason TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolvedAt DATETIME,
    INDEX(post_id),
    INDEX(reporter_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: topics
CREATE TABLE topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    image_url VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: user_topics
CREATE TABLE user_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    topic_id INT NOT NULL,
    UNIQUE KEY unique_user_topic (user_id, topic_id),
    INDEX(user_id),
    INDEX(topic_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- Table: Account
CREATE TABLE Account (
    id VARCHAR(255) PRIMARY KEY,
    userId INT NOT NULL,
    type VARCHAR(255),
    provider VARCHAR(255),
    providerAccountId VARCHAR(255),
    refresh_token TEXT,
    access_token TEXT,
    expires_at INT,
    token_type VARCHAR(255),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    UNIQUE KEY unique_provider (provider, providerAccountId),
    INDEX(userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: Session
CREATE TABLE Session (
    id VARCHAR(255) PRIMARY KEY,
    sessionToken VARCHAR(255) UNIQUE,
    userId INT NOT NULL,
    expires DATETIME,
    INDEX(userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: VerificationToken
CREATE TABLE VerificationToken (
    identifier VARCHAR(255),
    token VARCHAR(255) UNIQUE,
    expires DATETIME,
    UNIQUE KEY unique_identifier_token (identifier, token)
);

-- Table: banned_keywords
CREATE TABLE banned_keywords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(255) UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: copyrightViolation
CREATE TABLE copyrightViolation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    reporter_id INT NOT NULL,
    violation_type VARCHAR(50),
    description TEXT,
    status VARCHAR(20),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(post_id),
    INDEX(reporter_id),
    INDEX(status),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);
