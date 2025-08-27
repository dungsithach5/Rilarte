-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_related_user_id_fkey` FOREIGN KEY (`related_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
