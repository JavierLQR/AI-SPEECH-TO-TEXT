/*
  Warnings:

  - You are about to drop the column `upteadAt` on the `ProductChatBot` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `ProductChatBot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductChatBot" DROP COLUMN "upteadAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
