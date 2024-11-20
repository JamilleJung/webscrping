-- CreateTable
CREATE TABLE `Deposit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order` VARCHAR(191) NOT NULL,
    `bankUser` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `beforeDeposit` DOUBLE NOT NULL,
    `deposit` DOUBLE NOT NULL,
    `remainingBalance` DOUBLE NOT NULL,
    `transactionTime` TIMESTAMP(3) NOT NULL,
    `slipTime` TIMESTAMP(3) NOT NULL,
    `bankDeposit` VARCHAR(191) NOT NULL,
    `madeBy` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NULL,
    `aff` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Deposit_order_key`(`order`),
    INDEX `Deposit_username_idx`(`username`),
    INDEX `Deposit_bankUser_idx`(`bankUser`),
    INDEX `Deposit_transactionTime_idx`(`transactionTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `fullName` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `bank` VARCHAR(191) NULL,
    `referrer` VARCHAR(191) NULL,
    `marketingTeam` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    INDEX `User_phone_idx`(`phone`),
    INDEX `User_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
