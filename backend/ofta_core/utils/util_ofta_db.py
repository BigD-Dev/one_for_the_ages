# ofta_core/utils/util_db.py
"""
Database connector for OFTA - mirrors TascDBConnector pattern
"""

import os
import logging
from io import StringIO
import pandas as pd
from pandas import DataFrame
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool
from psycopg2 import sql, extras
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Database credentials
ofta_db_host = os.getenv('OFTA_DB_HOST')
ofta_db_port = os.getenv('OFTA_DB_PORT')
ofta_db_name = os.getenv('OFTA_DB_NAME')
ofta_db_username = os.getenv('OFTA_DB_USERNAME')
ofta_db_password = os.getenv('OFTA_DB_PASSWORD')

logger = logging.getLogger(__name__)

# Global connection instance for singleton pattern
_global_db_connector = None


def get_db_connector(force_new=False):
    """
    Singleton pattern to ensure only one database connector per process.
    
    Args:
        force_new (bool): Force creation of new connector (useful for testing)
    
    Returns:
        OftaDBConnector: Shared database connector instance
    """
    global _global_db_connector
    
    if force_new or _global_db_connector is None:
        _global_db_connector = OftaDBConnector(
            host=ofta_db_host,
            database=ofta_db_name,
            port=ofta_db_port,
            username=ofta_db_username,
            password=ofta_db_password,
        )
        logger.info("✅ OftaDBConnector initialized")
    
    return _global_db_connector


class OftaDBConnector:
    """Handles connections and operations for the OFTA database."""
    
    def __init__(
        self,
        server_adapter: str = 'postgresql+psycopg2',
        host: str = ofta_db_host,
        database: str = ofta_db_name,
        port: int = ofta_db_port,
        username: str = '',
        password: str = '',
        ssl_mode: str = 'require',
        pool_size: int = 1,
        max_overflow: int = 1,
        pool_recycle: int = 1800,
        pool_pre_ping: bool = True,
        pool_timeout: int = 30
    ):
        self.host = host
        self.database = database
        self.port = port
        self.username = username or ofta_db_username
        self.password = password or ofta_db_password
        self.ssl_mode = ssl_mode
        
        # Build connection string
        self.connection_string = (
            f"{server_adapter}://{self.username}:{self.password}"
            f"@{self.host}:{self.port}/{self.database}"
        )
        
        # Create SQLAlchemy engine
        self.engine = create_engine(
            self.connection_string,
            pool_size=pool_size,
            max_overflow=max_overflow,
            pool_recycle=pool_recycle,
            pool_pre_ping=pool_pre_ping,
            pool_timeout=pool_timeout,
            connect_args={'sslmode': ssl_mode} if ssl_mode else {}
        )
        
        logger.info(f"OftaDBConnector initialized for {self.database}")
    
    def select_df(self, query: str, params: dict = None) -> DataFrame:
        """
        Executes a SELECT query and returns results as a Pandas DataFrame.
        
        Args:
            query (str): SQL SELECT query
            params (dict, optional): Query parameters
        
        Returns:
            DataFrame: Query result as a Pandas DataFrame
        """
        try:
            with self.engine.connect() as conn:
                df = pd.read_sql(text(query), conn, params=params)
            return df
        except Exception as e:
            logger.error(f"Error executing select_df: {e}")
            raise
    
    def execute_query(self, query: str, params: dict = None):
        """
        Executes an INSERT, UPDATE, or DELETE query.
        
        Args:
            query (str): SQL command
            params (dict, optional): Query parameters
        """
        try:
            with self.engine.connect() as conn:
                conn.execute(text(query), params or {})
                conn.commit()
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            raise
    
    def insert_df(
        self,
        table_schema: str,
        table_name: str,
        df: pd.DataFrame,
        on_conflict_do_nothing: bool = False
    ):
        """
        Inserts a DataFrame into schema.table_name.
        
        Args:
            table_schema (str): Schema name
            table_name (str): Table name
            df (pd.DataFrame): DataFrame to insert
            on_conflict_do_nothing (bool): Use ON CONFLICT DO NOTHING
        """
        if df.empty:
            logger.warning("Empty DataFrame, skipping insert")
            return
        
        try:
            full_table = f"{table_schema}.{table_name}"
            
            if on_conflict_do_nothing:
                # Use to_sql with if_exists='append'
                df.to_sql(
                    table_name,
                    self.engine,
                    schema=table_schema,
                    if_exists='append',
                    index=False,
                    method='multi'
                )
            else:
                # Fast COPY method
                conn = psycopg2.connect(
                    host=self.host,
                    port=self.port,
                    database=self.database,
                    user=self.username,
                    password=self.password
                )
                cursor = conn.cursor()
                
                # Create CSV buffer
                buffer = StringIO()
                df.to_csv(buffer, index=False, header=False)
                buffer.seek(0)
                
                # COPY from buffer
                cursor.copy_from(
                    buffer,
                    full_table,
                    sep=',',
                    null='',
                    columns=list(df.columns)
                )
                
                conn.commit()
                cursor.close()
                conn.close()
            
            logger.info(f"Inserted {len(df)} rows into {full_table}")
            
        except Exception as e:
            logger.error(f"Error inserting DataFrame: {e}")
            raise
    
    def bulk_upsert_df(
        self,
        df: DataFrame,
        table_schema: str,
        table_name: str,
        conflict_columns: list[str],
        where_cols: list[str] | None = None,
    ):
        """
        Efficiently upsert a large DataFrame using COPY + temp table.
        
        Args:
            df: DataFrame to upsert
            table_schema: Schema name
            table_name: Table name
            conflict_columns: Columns to use for conflict detection
            where_cols: Optional WHERE clause columns for partial updates
        """
        if df.empty:
            logger.warning("Empty DataFrame, skipping upsert")
            return
        
        try:
            conn = psycopg2.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.username,
                password=self.password
            )
            cursor = conn.cursor()
            
            # Create temp table
            temp_table = f"temp_{table_name}_{os.getpid()}"
            full_table = f"{table_schema}.{table_name}"
            
            cursor.execute(f"""
                CREATE TEMP TABLE {temp_table} 
                (LIKE {full_table} INCLUDING DEFAULTS)
                ON COMMIT DROP
            """)
            
            # COPY data to temp table
            buffer = StringIO()
            df.to_csv(buffer, index=False, header=False)
            buffer.seek(0)
            
            cursor.copy_from(
                buffer,
                temp_table,
                sep=',',
                null='',
                columns=list(df.columns)
            )
            
            # Build upsert query
            columns = list(df.columns)
            conflict_clause = ', '.join(conflict_columns)
            update_clause = ', '.join([
                f"{col} = EXCLUDED.{col}"
                for col in columns
                if col not in conflict_columns
            ])
            
            upsert_query = f"""
                INSERT INTO {full_table} ({', '.join(columns)})
                SELECT {', '.join(columns)} FROM {temp_table}
                ON CONFLICT ({conflict_clause})
                DO UPDATE SET {update_clause}
            """
            
            cursor.execute(upsert_query)
            conn.commit()
            
            logger.info(f"Upserted {len(df)} rows into {full_table}")
            
            cursor.close()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error in bulk_upsert_df: {e}")
            raise
    
    def get_pool_status(self):
        """Returns current connection pool status for monitoring."""
        return {
            "pool_size": self.engine.pool.size(),
            "checked_in": self.engine.pool.checkedin(),
            "checked_out": self.engine.pool.checkedout(),
            "overflow": self.engine.pool.overflow(),
        }
    
    def close_all_connections(self):
        """Closes all connections in the pool."""
        self.engine.dispose()
        logger.info("All database connections closed")
