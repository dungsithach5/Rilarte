/*
  Warnings:

  - You are about to drop the column `user_id` on the `posts` table. All the data in the column will be lost.
  - Made the column `user_id` on table `comments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `post_id` on table `comments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `follower_id` on table `follows` required. This step will fail if there are existing NULL values in that column.
  - Made the column `following_id` on table `follows` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `likes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `post_id` on table `likes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_read` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_name` on table `posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image_url` on table `posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avatar_url` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_ibfk_1`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_ibfk_2`;

-- DropForeignKey
ALTER TABLE `follows` DROP FOREIGN KEY `follows_ibfk_1`;

-- DropForeignKey
ALTER TABLE `follows` DROP FOREIGN KEY `follows_ibfk_2`;

-- DropForeignKey
ALTER TABLE `likes` DROP FOREIGN KEY `likes_ibfk_1`;

-- DropForeignKey
ALTER TABLE `likes` DROP FOREIGN KEY `likes_ibfk_2`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_ibfk_1`;

-- DropIndex
DROP INDEX `user_id` ON `posts`;

-- AlterTable
ALTER TABLE `comments` MODIFY `user_id` INTEGER NOT NULL,
    MODIFY `post_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `follows` MODIFY `follower_id` INTEGER NOT NULL,
    MODIFY `following_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `likes` MODIFY `user_id` INTEGER NOT NULL,
    MODIFY `post_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `user_id` INTEGER NOT NULL,
    MODIFY `type` VARCHAR(50) NOT NULL,
    MODIFY `content` TEXT NOT NULL,
    MODIFY `is_read` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `posts` DROP COLUMN `user_id`,
    MODIFY `user_name` VARCHAR(45) NOT NULL,
    MODIFY `title` TEXT NOT NULL,
    MODIFY `content` TEXT NOT NULL,
    MODIFY `image_url` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `avatar_url` VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE `banned_keywords` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `word` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `banned_keywords_word_key`(`word`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
