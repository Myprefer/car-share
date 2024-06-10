import yaml
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


def read_config_file(file_path):
    with open(file_path, 'r') as file:
        config = yaml.safe_load(file)
    return config


database_info = read_config_file('backend/config/config.yaml')['database']
username = database_info['username']
password = database_info['password']
host = database_info['host']
port = database_info['port']
dbname = database_info['database_name']

# MySQL 数据库 URL 配置
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{username}:{password}@{host}:{port}/{dbname}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
