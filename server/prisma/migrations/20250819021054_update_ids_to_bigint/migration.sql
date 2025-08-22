/*
  Warnings:

  - The primary key for the `comments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `posts` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `chat_rooms` DROP FOREIGN KEY `chat_rooms_last_message_id_fkey`;

-- DropForeignKey
ALTER TABLE `comment_likes` DROP FOREIGN KEY `comment_likes_comment_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_ibfk_2`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_parent_id_fkey`;

-- DropForeignKey
ALTER TABLE `likes` DROP FOREIGN KEY `likes_ibfk_2`;

-- DropForeignKey
ALTER TABLE `post_tags` DROP FOREIGN KEY `post_tags_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `related_posts` DROP FOREIGN KEY `related_posts_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `related_posts` DROP FOREIGN KEY `related_posts_related_id_fkey`;

-- DropForeignKey
ALTER TABLE `report_posts` DROP FOREIGN KEY `report_posts_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `saved_posts` DROP FOREIGN KEY `saved_posts_post_id_fkey`;

-- AlterTable
ALTER TABLE `chat_rooms` MODIFY `last_message_id` BIGINT NULL;

-- AlterTable
ALTER TABLE `comment_likes` MODIFY `comment_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `comments` DROP PRIMARY KEY,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `post_id` BIGINT NOT NULL,
    MODIFY `parent_id` BIGINT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `likes` MODIFY `post_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `messages` DROP PRIMARY KEY,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `post_tags` MODIFY `post_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `posts` DROP PRIMARY KEY,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `related_posts` MODIFY `post_id` BIGINT NOT NULL,
    MODIFY `related_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `report_posts` MODIFY `post_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `saved_posts` MODIFY `post_id` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `comment_likes` ADD CONSTRAINT `comment_likes_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_rooms` ADD CONSTRAINT `chat_rooms_last_message_id_fkey` FOREIGN KEY (`last_message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `related_posts` ADD CONSTRAINT `related_posts_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `related_posts` ADD CONSTRAINT `related_posts_related_id_fkey` FOREIGN KEY (`related_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_posts` ADD CONSTRAINT `report_posts_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saved_posts` ADD CONSTRAINT `saved_posts_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
