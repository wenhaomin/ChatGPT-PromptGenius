from flask import Flask
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class SubmitFunction(db.Model):
    __tablename__ = 'user_submit_function'
    funcDesc = db.Column(db.String, primary_key=True)
    createTime = db.Column(db.String, primary_key=True)
    promptContent = db.Column(db.String)
    userName = db.Column(db.String)
