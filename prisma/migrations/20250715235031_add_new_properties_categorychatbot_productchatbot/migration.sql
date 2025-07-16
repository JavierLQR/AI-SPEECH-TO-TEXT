/*
  Warnings:

  - You are about to alter the column `price` on the `ProductChatBot` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[name]` on the table `ProductChatBot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stock` to the `ProductChatBot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upteadAt` to the `ProductChatBot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ProductChatBot_name_categoryId_key";

-- AlterTable
ALTER TABLE "ProductChatBot" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stock" INTEGER NOT NULL,
ADD COLUMN     "upteadAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "ProductChatBot_name_key" ON "ProductChatBot"("name");
