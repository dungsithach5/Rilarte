/*
  Warnings:

  - Added the required column `room_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Made the column `sender_id` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `receiver_id` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_read` on table `messages` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_ibfk_1`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_ibfk_2`;

-- AlterTable
ALTER TABLE `messages` ADD COLUMN `file_name` VARCHAR(255) NULL,
    ADD COLUMN `file_size` INTEGER NULL,
    ADD COLUMN `file_url` VARCHAR(255) NULL,
    ADD COLUMN `message_type` VARCHAR(20) NOT NULL DEFAULT 'text',
    ADD COLUMN `read_at` DATETIME(3) NULL,
    ADD COLUMN `room_id` VARCHAR(100) NOT NULL,
    MODIFY `sender_id` INTEGER NOT NULL,
    MODIFY `receiver_id` INTEGER NOT NULL,
    MODIFY `content` TEXT NOT NULL,
    MODIFY `is_read` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- CreateTable
CREATE TABLE `chat_rooms` (
    `id` VARCHAR(100) NOT NULL,
    `user1_id` INTEGER NOT NULL,
    `user2_id` INTEGER NOT NULL,
    `last_message_id` INTEGER NULL,
    `last_message_at` DATETIME(3) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `chat_rooms_user1_id_idx`(`user1_id`),
    INDEX `chat_rooms_user2_id_idx`(`user2_id`),
    INDEX `chat_rooms_last_message_at_idx`(`last_message_at`),
    UNIQUE INDEX `chat_rooms_user1_id_user2_id_key`(`user1_id`, `user2_id`),
    UNIQUE INDEX `chat_rooms_last_message_id_key`(`last_message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `messages_room_id_idx` ON `messages`(`room_id`);

-- CreateIndex
CREATE INDEX `messages_createdAt_idx` ON `messages`(`createdAt`);

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_rooms` ADD CONSTRAINT `chat_rooms_user1_id_fkey` FOREIGN KEY (`user1_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_rooms` ADD CONSTRAINT `chat_rooms_user2_id_fkey` FOREIGN KEY (`user2_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_rooms` ADD CONSTRAINT `chat_rooms_last_message_id_fkey` FOREIGN KEY (`last_message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `messages_receiver_id_idx` ON `messages`(`receiver_id`);
DROP INDEX `receiver_id` ON `messages`;

-- RedefineIndex
CREATE INDEX `messages_sender_id_idx` ON `messages`(`sender_id`);
DROP INDEX `sender_id` ON `messages`;
