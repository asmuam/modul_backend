/*
  Warnings:

  - You are about to alter the column `username` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `username` VARCHAR(20) NOT NULL;
