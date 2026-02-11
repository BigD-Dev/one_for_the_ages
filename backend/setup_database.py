#!/usr/bin/env python3
"""
Database Schema Setup Script for OFTA

Usage:
    python setup_database.py --host localhost --port 5432 --database ofta_db --user postgres
"""

import os
import sys
import argparse
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

load_dotenv()


def run_schema(host: str, port: int, database: str, user: str, password: str):
    """Run the schema.sql file against the database."""
    
    print(f"🔌 Connecting to PostgreSQL at {host}:{port}/{database}...")
    
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✅ Connected successfully!")
        
        # Read schema file
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        print(f"📄 Reading schema from {schema_path}...")
        
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Execute schema
        print("🔨 Creating schema and tables...")
        cursor.execute(schema_sql)
        
        print("✅ Schema created successfully!")
        
        # Verify tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'da_prod' 
              AND table_name LIKE 'ofta_%'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"\n📊 Created {len(tables)} OFTA tables in da_prod schema:")
        for table in tables:
            print(f"   ✓ {table[0]}")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Database setup complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description='Setup OFTA database schema')
    parser.add_argument('--host', default=os.getenv('OFTA_DB_HOST', 'localhost'))
    parser.add_argument('--port', type=int, default=int(os.getenv('OFTA_DB_PORT', 5432)))
    parser.add_argument('--database', default=os.getenv('OFTA_DB_NAME', 'ofta_db'))
    parser.add_argument('--user', default=os.getenv('OFTA_DB_USERNAME', 'postgres'))
    parser.add_argument('--password', default=os.getenv('OFTA_DB_PASSWORD', ''))
    
    args = parser.parse_args()
    
    if not args.password:
        import getpass
        args.password = getpass.getpass('Database password: ')
    
    run_schema(
        host=args.host,
        port=args.port,
        database=args.database,
        user=args.user,
        password=args.password
    )


if __name__ == '__main__':
    main()
