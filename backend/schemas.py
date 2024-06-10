from pydantic import BaseModel
from datetime import date, time, datetime
from typing import Optional, List


class Trip(BaseModel):
    trip_id: int
    user_id: int
    departure: str
    destination: str
    stops: Optional[str] = None
    date: date
    time: time
    seats_available: int
    price: float
    notes: Optional[str] = None
    creation_date: datetime
    publish: str


class TripSearch(BaseModel):
    departure: str
    destination: str
    date: date


class TripResponse(BaseModel):
    trip_id: int
    departure: str
    destination: str
    date: date
    time: time
    seats_available: int
    price: float
    publish: str


class BookingCreate(BaseModel):
    trip_id: int
    user_id: int


class BookingResponse(BaseModel):
    booking_id: int
    trip_id: int
    user_id: int
    booking_date: datetime
    status: str


class BookingDataResponse(BaseModel):
    booking_id: int
    publish: str
    departure: str
    destination: str
    price: float
    date: date
    time: time


