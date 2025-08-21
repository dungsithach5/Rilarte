/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;

-- DropForeignKey
ALTER TABLE `chat_rooms` DROP FOREIGN KEY `chat_rooms_user1_id_fkey`;

-- DropForeignKey
ALTER TABLE `chat_rooms` DROP FOREIGN KEY `chat_rooms_user2_id_fkey`;

-- DropForeignKey
ALTER TABLE `comment_likes` DROP FOREIGN KEY `comment_likes_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_ibfk_1`;

-- DropForeignKey
ALTER TABLE `follows` DROP FOREIGN KEY `follows_ibfk_1`;

-- DropForeignKey
ALTER TABLE `follows` DROP FOREIGN KEY `follows_ibfk_2`;

-- DropForeignKey
ALTER TABLE `likes` DROP FOREIGN KEY `likes_ibfk_1`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_receiver_id_fkey`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_sender_id_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_ibfk_1`;

-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `report_posts` DROP FOREIGN KEY `report_posts_reporter_id_fkey`;

-- DropForeignKey
ALTER TABLE `saved_posts` DROP FOREIGN KEY `saved_posts_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_topics` DROP FOREIGN KEY `user_topics_user_id_fkey`;

-- DropIndex
DROP INDEX `posts_user_id_fkey` ON `posts`;

-- AlterTable
ALTER TABLE `Account` MODIFY `userId` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `Session` MODIFY `userId` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `chat_rooms` MODIFY `user1_id` BIGINT NOT NULL,
    MODIFY `user2_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `comment_likes` MODIFY `user_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `comments` MODIFY `user_id` BIGINT NOT NULL,
    MODIFY `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `follows` MODIFY `follower_id` BIGINT NOT NULL,
    MODIFY `following_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `likes` MODIFY `user_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `messages` MODIFY `sender_id` BIGINT NOT NULL,
    MODIFY `receiver_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `user_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `posts` MODIFY `user_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `report_posts` MODIFY `user_id` BIGINT NOT NULL,
    MODIFY `reporter_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `saved_posts` MODIFY `user_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `user_topics` MODIFY `user_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `comment_likes` ADD CONSTRAINT `comment_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_rooms` ADD CONSTRAINT `chat_rooms_user1_id_fkey` FOREIGN KEY (`user1_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_rooms` ADD CONSTRAINT `chat_rooms_user2_id_fkey` FOREIGN KEY (`user2_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_posts` ADD CONSTRAINT `report_posts_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_topics` ADD CONSTRAINT `user_topics_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saved_posts` ADD CONSTRAINT `saved_posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `likes_ibfk_1` ON `likes`(`user_id`);
DROP INDEX `user_id` ON `likes`;
