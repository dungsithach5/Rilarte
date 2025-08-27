-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `related_comment_id` INTEGER NULL,
    ADD COLUMN `related_post_id` INTEGER NULL,
    ADD COLUMN `related_user_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `notifications_related_user_id_idx` ON `notifications`(`related_user_id`);

-- CreateIndex
CREATE INDEX `notifications_related_post_id_idx` ON `notifications`(`related_post_id`);

-- CreateIndex
CREATE INDEX `notifications_related_comment_id_idx` ON `notifications`(`related_comment_id`);
