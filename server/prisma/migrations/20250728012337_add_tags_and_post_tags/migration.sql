-- CreateTable
CREATE TABLE `related_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `related_id` INTEGER NOT NULL,

    INDEX `related_posts_post_id_idx`(`post_id`),
    INDEX `related_posts_related_id_idx`(`related_id`),
    UNIQUE INDEX `related_posts_post_id_related_id_key`(`post_id`, `related_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tags_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    INDEX `post_tags_post_id_idx`(`post_id`),
    INDEX `post_tags_tag_id_idx`(`tag_id`),
    UNIQUE INDEX `post_tags_post_id_tag_id_key`(`post_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `related_posts` ADD CONSTRAINT `related_posts_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `related_posts` ADD CONSTRAINT `related_posts_related_id_fkey` FOREIGN KEY (`related_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
