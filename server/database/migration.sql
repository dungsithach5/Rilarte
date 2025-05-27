
-- Database: social_media_app

-- Database tạm thời (có thể thay đổi trong tương lai)


-- Drop tables if they exist
DROP TABLE IF EXISTS notifications, resources, friends, likes, comments, posts, users;

-- USERS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255),
  bio TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- POSTS
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT,
  image_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- COMMENTS
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- LIKES
CREATE TABLE likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

-- FRIENDS
CREATE TABLE friends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  friend_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, friend_id)
);

-- RESOURCES
CREATE TABLE resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT,
  file_url VARCHAR(255) NOT NULL,
  type ENUM('image', 'pdf', 'docx', 'other') DEFAULT 'other',
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- ALTER USERS: Thêm role
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin', 'moderator') DEFAULT 'user';

-- MESSAGES (chat trực tiếp giữa người dùng)
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- FULLTEXT INDEX cho tìm kiếm bài viết
ALTER TABLE posts ADD FULLTEXT(content);
