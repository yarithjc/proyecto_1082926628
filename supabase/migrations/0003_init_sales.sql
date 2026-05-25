CREATE TABLE IF NOT EXISTS sales (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID          NOT NULL REFERENCES products(id),
  sold_by     UUID          REFERENCES users(id) ON DELETE SET NULL,
  quantity    INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price  DECIMAL(10,2) NOT NULL,
  total       DECIMAL(12,2) NOT NULL,
  sold_at     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_product  ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date     ON sales(sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_sold_by  ON sales(sold_by);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_role_all ON sales;
CREATE POLICY service_role_all ON sales FOR ALL TO service_role USING (true) WITH CHECK (true);
