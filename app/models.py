from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user


# 创建用户模型
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, index=True)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return '<User %r>' % self.username


class SubmitFunction(db.Model):
    __tablename__ = 'user_submit_function'
    funcDesc = db.Column(db.String, primary_key=True)
    createTime = db.Column(db.String, primary_key=True)
    promptContent = db.Column(db.String)
    userName = db.Column(db.String)


class Languages(db.Model):
    __tablename__ = 'languages'
    code = db.Column(db.String, primary_key=True)
    name = db.Column(db.String)


class IndexContents(db.Model):
    __tablename__ = 'index_contents'
    lanCode = db.Column(db.String, primary_key=True)
    location = db.Column(db.String, primary_key=True)
    ID = db.Column(db.String, primary_key=True)
    content = db.Column(db.String)


class Tools(db.Model):
    __tablename__ = 'tools'
    lanCode = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, primary_key=True)
    desc = db.Column(db.String)
    url = db.Column(db.String)
    icon_src = db.Column(db.String)
    tags = db.Column(db.String)


class Classes(db.Model):
    __tablename__ = 'classes'
    ID = db.Column(db.String, primary_key=True)  # class ID
    icon = db.Column(db.String)
    icon_style = db.Column(db.String)
    childrens = db.Column(db.String)  # class IDs of childrens, split by ','


class ClassNames(db.Model):
    __tablename__ = 'class_names'
    ID = db.Column(db.String, primary_key=True)  # class ID
    lanCode = db.Column(db.String, primary_key=True)
    name = db.Column(db.String)  # Human-readable name of this class


class Functions(db.Model):
    __tablename__ = 'functions'
    ID = db.Column(db.String, primary_key=True)  # function ID
    classes = db.Column(db.String)  # class IDs of this function


class FunctionNames(db.Model):
    __tablename__ = 'function_names'
    ID = db.Column(db.String, primary_key=True)  # function ID
    lanCode = db.Column(db.String, primary_key=True)
    name = db.Column(db.String)  # Human-readable name of this function


class FunctionPrompts(db.Model):
    __tablename__ = 'function_prompts'
    functionID = db.Column(db.String, primary_key=True)  # function ID
    semanticID = db.Column(db.String, primary_key=True)
    lanCode = db.Column(db.String, primary_key=True)
    priority = db.Column(db.Integer)  # Priority rank
    model = db.Column(db.String)  # AI model name
    content = db.Column(db.String)  # Prompt contents
    author = db.Column(db.String)
    author_link = db.Column(db.String)
    copied_count = db.Column(db.Integer)


class PromptDialogs(db.Model):
    __tablename__ = 'prompt_dialogs'
    functionID = db.Column(db.String, primary_key=True)  # function ID
    semanticID = db.Column(db.String, primary_key=True)
    lanCode = db.Column(db.String, primary_key=True)
    model = db.Column(db.String, primary_key=True)  # AI model name
    dialog_index = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String)


class Banners(db.Model):
    __tablename__ = 'banners'
    index = db.Column(db.Integer, primary_key=True)
    lanCode = db.Column(db.String, primary_key=True)
    image = db.Column(db.String)
    url = db.Column(db.String)
