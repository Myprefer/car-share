import yaml
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Time, Float, TIMESTAMP, Enum
from .database import Base


class User(Base):
    __tablename__ = "userinfo"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    phoneNumber = Column(String, unique=True, index=True)
    registerTime = Column(DateTime(timezone=True), server_default=func.now())
    password = Column(String)

    bookings = relationship("Booking", back_populates="user")


class Trip(Base):
    __tablename__ = "trips"

    trip_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("userinfo.id"))
    time = Column(Time, nullable=False)
    destination = Column(String, nullable=False)
    departure = Column(String, nullable=False)
    stops = Column(String)
    date = Column(Date)
    seats_available = Column(Integer)
    price = Column(Float)
    notes = Column(String)
    creation_date = Column(TIMESTAMP, default=func.now())
    publish = Column(String)

    bookings = relationship("Booking", back_populates="trip")


class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.trip_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("userinfo.id"), nullable=False)
    booking_date = Column(TIMESTAMP, default=func.now())
    status = Column(Enum("pending", "confirmed", "cancelled"), default="pending")

    trip = relationship("Trip", back_populates="bookings")
    user = relationship("User", back_populates="bookings")