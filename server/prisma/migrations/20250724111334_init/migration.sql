-- RedefineIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);
DROP INDEX `username` ON `users`;
