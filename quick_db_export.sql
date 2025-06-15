-- Quick Database Export for Freelancing Platform
-- Copy and run these commands to export your data

-- Method 1: Export table structures
SELECT 
    'CREATE TABLE ' || schemaname || '.' || tablename || ' (' ||
    array_to_string(
        array_agg(
            column_name || ' ' || data_type ||
            case when character_maximum_length is not null 
                then '(' || character_maximum_length || ')' 
                else '' 
            end ||
            case when is_nullable = 'NO' then ' NOT NULL' else '' end
        ), 
        ', '
    ) || ');' as create_statement
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Method 2: Export user data
SELECT 'INSERT INTO users VALUES (' ||
  quote_literal(id) || ',' ||
  COALESCE(quote_literal(email), 'NULL') || ',' ||
  COALESCE(quote_literal(first_name), 'NULL') || ',' ||
  COALESCE(quote_literal(last_name), 'NULL') || ',' ||
  COALESCE(quote_literal(profile_image_url), 'NULL') || ',' ||
  quote_literal(user_type) || ',' ||
  COALESCE(quote_literal(title), 'NULL') || ',' ||
  COALESCE(quote_literal(bio), 'NULL') || ',' ||
  COALESCE(hourly_rate::text, 'NULL') || ',' ||
  COALESCE(quote_literal(array_to_string(skills, ',')), 'NULL') || ',' ||
  COALESCE(quote_literal(location), 'NULL') || ',' ||
  COALESCE(quote_literal(company), 'NULL') || ',' ||
  quote_literal(created_at::text) || ',' ||
  quote_literal(updated_at::text) ||
  ');' as insert_statement
FROM users;