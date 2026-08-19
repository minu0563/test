/*
  Warnings:

  - You are about to drop the `userprofile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `chatsession` DROP FOREIGN KEY `ChatSession_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userprofile` DROP FOREIGN KEY `UserProfile_userId_fkey`;

-- DropIndex
DROP INDEX `ChatSession_userId_fkey` ON `chatsession`;

-- DropTable
DROP TABLE `userprofile`;

-- CreateTable
CREATE TABLE `StudentInfo` (
    `userId` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL DEFAULT '',
    `currentGrade` INTEGER NULL,
    `classNo` INTEGER NULL,
    `percentile1` DOUBLE NULL,
    `percentile2` DOUBLE NULL,
    `percentile3` DOUBLE NULL,
    `targetJob` TEXT NULL,
    `targetCompanies` TEXT NULL,
    `strengths` TEXT NULL,
    `perfectAttendance` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `schoolYear` INTEGER NOT NULL,
    `absentUnexcused` INTEGER NOT NULL DEFAULT 0,
    `absentSick` INTEGER NOT NULL DEFAULT 0,
    `lateUnexcused` INTEGER NOT NULL DEFAULT 0,
    `lateSick` INTEGER NOT NULL DEFAULT 0,
    `earlyLeave` INTEGER NOT NULL DEFAULT 0,
    `classSkip` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Attendance_userId_schoolYear_key`(`userId`, `schoolYear`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Activity` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('AWARD', 'MDP', 'PROJECT', 'CERT', 'CLUB', 'ETC') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `organization` VARCHAR(191) NULL,
    `award` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `role` TEXT NULL,
    `teamSize` INTEGER NULL,
    `techStack` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `result` TEXT NULL,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Activity_userId_type_idx`(`userId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ChatSession_userId_updatedAt_idx` ON `ChatSession`(`userId`, `updatedAt`);

-- CreateIndex
CREATE INDEX `Message_chatSessionId_createdAt_idx` ON `Message`(`chatSessionId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `ChatSession` ADD CONSTRAINT `ChatSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentInfo` ADD CONSTRAINT `StudentInfo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `account` RENAME INDEX `Account_userId_fkey` TO `Account_userId_idx`;
