from flask import Flask
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class UserSubmit(db.Model):
    __tablename__ = 'user_submit'
    rowIndex = db.Column(db.Integer, primary_key=True)
    funcDesc = db.Column(db.String)
    promptContent = db.Column(db.String)