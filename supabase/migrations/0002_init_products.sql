CREATE TABLE IF NOT EXISTS products (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  price         DECIMAL(10,2) NOT NULL CHECK (price > 0),
  current_stock INTEGER       NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  is_active     BOOLEAN       DEFAULT true,
  created_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  updated_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_name_unique
  ON products(LOWER(name))
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock  ON products(current_stock);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_role_all ON products;
CREATE POLICY service_role_all ON products FOR ALL TO service_role USING (true) WITH CHECK (true);
