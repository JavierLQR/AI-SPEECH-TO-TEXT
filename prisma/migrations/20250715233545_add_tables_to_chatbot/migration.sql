-- CreateTable
CREATE TABLE "CategoryChatBot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryChatBot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductChatBot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ProductChatBot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryChatBot_name_key" ON "CategoryChatBot"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductChatBot_name_categoryId_key" ON "ProductChatBot"("name", "categoryId");

-- AddForeignKey
ALTER TABLE "ProductChatBot" ADD CONSTRAINT "ProductChatBot_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryChatBot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
