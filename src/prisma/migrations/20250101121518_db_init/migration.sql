-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "category" SET DATA TYPE TEXT,
ALTER COLUMN "area" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_area_idx" ON "Product"("area");
