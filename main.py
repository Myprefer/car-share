import re
import yaml
from fastapi import FastAPI, HTTPException, status, Depends
import pymysql
from typing import List, Optional
from datetime import datetime, date, time
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.sql import func
from sqlalchemy.orm import Session, relationship
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from backend import database, models, auth, schemas
from backend.models import User, Trip

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class LoginRequest(BaseModel):
    phoneNumber: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    phoneNumber: str
    password: str


# 定义Pydantic模型
class TripCreate(BaseModel):
    destination: str
    departure: str
    stops: Optional[str] = None
    date: date
    time: time
    seats_available: int
    price: float
    notes: Optional[str] = None


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.options("/login")
async def login_options():
    return {"Allow": "POST"}, status.HTTP_200_OK


@app.options("/register")
async def login_options():
    return {"Allow": "POST"}, status.HTTP_200_OK


@app.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(database.get_db)):
    name = request.name
    phoneNumber = request.phoneNumber
    password = request.password
    user = db.query(models.User).filter(models.User.phoneNumber == phoneNumber).first()
    if user is not None:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    hashed_password = auth.get_password_hash(password)
    new_user = models.User(name=name, phoneNumber=phoneNumber, password=hashed_password, registerTime=func.now())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"msg": "User registered successfully"}


@app.post("/login")
async def login(request: LoginRequest, db: Session = Depends(database.get_db)):
    phoneNumber = request.phoneNumber
    password = request.password
    user = db.query(models.User).filter(models.User.phoneNumber == phoneNumber).first()
    if user is None or not auth.verify_password(password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect phone number or password")
    access_token = auth.create_access_token(data={"sub": user.phoneNumber})
    return {"access_token": access_token, "token_type": "bearer"}


# 获取用户信息
@app.get("/users/me/")
async def read_users_me(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(database.get_db)):
    phoneNumber = auth.verify_token(token)
    user = db.query(models.User).filter(models.User.phoneNumber == phoneNumber).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "name": user.name, "phoneNumber": user.phoneNumber, "registerTime": user.registerTime}


# 示例：获取用户的预约记录
# @app.get("/users/appointments/")
# async def get_user_appointments(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(database.get_db)):
#     phoneNumber = auth.verify_token(token)
#     user = db.query(models.User).filter(models.User.phoneNumber == phoneNumber).first()
#     if user is None:
#         raise HTTPException(status_code=404, detail="User not found")
#     # 模拟预约记录
#     appointments = [
#         {"time": "2024-01-01 10:00", "details": "Meeting with client A"},
#         {"time": "2024-01-02 14:00", "details": "Meeting with client B"}
#     ]
#     return appointments


# 示例：获取用户的行程发布记录
@app.get("/users/trips/")
async def get_user_trips(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(database.get_db)):
    phoneNumber = auth.verify_token(token)
    user = db.query(models.User).filter(models.User.phoneNumber == phoneNumber).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    # 模拟行程发布记录
    trips = [
        {"time": "2024-02-01 08:00", "destination": "City A"},
        {"time": "2024-02-05 09:00", "destination": "City B"}
    ]
    return trips


@app.post("/publish/")
async def get_user_trips(trip: TripCreate, token: str = Depends(auth.oauth2_scheme), db: Session = Depends(database.get_db)):
    phoneNumber = auth.verify_token(token)
    user = db.query(models.User).filter(models.User.phoneNumber == phoneNumber).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_trip = models.Trip(**trip.dict(), user_id=user.id, publish=user.name)
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)

    return db_trip


@app.get("/trips", response_model=List[schemas.Trip])
def get_trips(skip: int = 0, limit: int = 10, db: Session = Depends(database.get_db)):
    trips = db.query(models.Trip).order_by(models.Trip.trip_id).offset(skip).limit(limit).all()
    return trips


@app.post("/search_trips", response_model=List[schemas.Trip])
def search_trips(search: schemas.TripSearch, db: Session = Depends(database.get_db)):
    trips = db.query(models.Trip).order_by(models.Trip.trip_id).filter(
        models.Trip.departure == search.departure,
        models.Trip.destination == search.destination,
        models.Trip.date == search.date
        # models.Trip.time == search.time
    ).all()
    return trips


@app.post("/book_trip", response_model=schemas.BookingResponse)
def book_trip(booking: schemas.BookingCreate, db: Session = Depends(database.get_db)):
    # 验证 trip_id 和 user_id 是否存在
    trip = db.query(models.Trip).filter(models.Trip.trip_id == booking.trip_id).first()
    user = db.query(models.User).filter(models.User.id == booking.user_id).first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 检查是否有足够的座位
    if trip.seats_available <= 0:
        raise HTTPException(status_code=400, detail="没有余座")

    # 创建预订
    db_booking = models.Booking(
        trip_id=booking.trip_id,
        user_id=booking.user_id,
        status="pending"
    )

    # 减少 trip 中的座位数
    trip.seats_available -= 1

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    return db_booking


@app.get("/user_trips/{user_id}", response_model=List[schemas.TripResponse])
def get_user_trips(user_id: int, db: Session = Depends(database.get_db)):
    trips = db.query(models.Trip).filter(models.Trip.user_id == user_id).all()
    return trips


@app.get("/user_bookings/{user_id}", response_model=List[schemas.BookingDataResponse])
def get_user_bookings(user_id: int, db: Session = Depends(database.get_db)):
    bookings = db.query(models.Booking).filter(models.Booking.user_id == user_id).all()
    result = []
    for booking in bookings:
        trip = db.query(models.Trip).filter(models.Trip.trip_id == booking.trip_id).first()
        if trip:
            booking_data = {
                "booking_id": booking.booking_id,
                "departure": trip.departure,
                "destination": trip.destination,
                "date": trip.date,
                "time": trip.time,
                "publish": db.query(models.User).filter(models.User.id == trip.user_id).first().name,
                "price": trip.price
            }
            result.append(booking_data)
    return result
