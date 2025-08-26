/*
  Warnings:

  - A unique constraint covering the columns `[follower_id,following_id]` on the table `follows` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `follows` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `follows_follower_id_following_id_key` ON `follows`(`follower_id`, `following_id`);
