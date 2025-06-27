-- CreateTable
CREATE TABLE "ProductosEmbeddings" (
    "id" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "size" TEXT NOT NULL,

    CONSTRAINT "ProductosEmbeddings_pkey" PRIMARY KEY ("id")
);
