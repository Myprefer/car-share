import logging
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

# 密码哈希
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# JWT相关配置
SECRET_KEY = "7SsLef3MX4PnrVM"  # 确保SECRET_KEY一致
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# 定义一个用于认证失败的异常
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# def verify_token(token: str):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         phoneNumber: str = payload.get("sub")
#         if phoneNumber is None:
#             raise credentials_exception
#         return phoneNumber
#     except JWTError:
#         raise credentials_exception


logger = logging.getLogger("uvicorn.error")


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phoneNumber: str = payload.get("sub")
        if phoneNumber is None:
            raise credentials_exception
        return phoneNumber
    except JWTError as e:
        logger.error(f"JWTError: {e}")
        raise credentials_exception
