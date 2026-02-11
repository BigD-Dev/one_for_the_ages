# Data Products

This directory contains SQL scripts for creating and managing OFTA database objects.

## Structure

```
data_products/
└── table/
    └── create/
        └── *.sql  # Table creation scripts
```

## Usage

### Creating Tables

Place table creation scripts in `table/create/`:

```sql
-- Example: create_ofta_custom_table.sql
CREATE TABLE IF NOT EXISTS da_prod.ofta_custom_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ofta_custom_name ON da_prod.ofta_custom_table(name);
```

### Running Scripts

```bash
# Run a specific script
psql -d ofta_db -f data_products/table/create/create_ofta_custom_table.sql

# Or use the Python connector
python -c "
from ofta_core.utils.util_db import get_db_connector
db = get_db_connector()
with open('data_products/table/create/create_ofta_custom_table.sql') as f:
    db.execute_query(f.read())
"
```

## Naming Conventions

- **Tables**: `da_prod.ofta_{table_name}`
- **Views**: `da_prod.v_ofta_{view_name}`
- **Functions**: `da_prod.ofta_{function_name}`
- **Indexes**: `idx_ofta_{table}_{column}`
- **Triggers**: `ofta_trigger_{name}`

## Guidelines

1. Always use `IF NOT EXISTS` for idempotency
2. Always use the `da_prod` schema
3. Always prefix OFTA objects with `ofta_` or `v_ofta_`
4. Include proper indexes for foreign keys and frequently queried columns
5. Add comments for complex logic
6. Use `TIMESTAMPTZ` for all timestamps
7. Use `UUID` for primary keys with `gen_random_uuid()`

## Example Scripts

See `../backend/schema.sql` for the main schema definition.
