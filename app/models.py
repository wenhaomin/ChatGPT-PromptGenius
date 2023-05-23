from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, String, Integer
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, index=True)
    password_hash = Column(String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_id(self):
        return str(self.id)

    def __repr__(self):
        return '<User %r>' % self.username


class UserFavPrompt(db.Model):
    __tablename__ = 'user_fav_prompt'
    userID = Column(Integer, db.ForeignKey('users.id'), primary_key=True)
    favID = Column(Integer, primary_key=True)
    functionID = Column(String, db.ForeignKey('function_prompts.functionID'))
    semanticID = Column(String, db.ForeignKey('function_prompts.semanticID'))
    lanCode = Column(String, db.ForeignKey('function_prompts.lanCode'))


class SubmitFunction(db.Model):
    __tablename__ = 'user_submit_function'
    __table_args__ = {'extend_existing': True}
    funcDesc = Column(String, primary_key=True)
    createTime = Column(String, primary_key=True)
    promptContent = Column(String)
    userName = Column(String)
    archived = Column(Integer, default=0)


class Languages(db.Model):
    __tablename__ = 'languages'
    __table_args__ = {'extend_existing': True}
    code = Column(String, primary_key=True)
    name = Column(String)


class Tools(db.Model):
    __tablename__ = 'tools'
    __table_args__ = {'extend_existing': True}
    lanCode = Column(String, primary_key=True)
    name = Column(String, primary_key=True)
    desc = Column(String)
    url = Column(String)
    icon_src = Column(String)
    tags = Column(String)


class Classes(db.Model):
    __tablename__ = 'classes'
    __table_args__ = {'extend_existing': True}
    ID = Column(String, primary_key=True)  # class ID
    icon = Column(String)
    icon_style = Column(String)
    childrens = Column(String)  # class IDs of childrens, split by ','


class ClassNames(db.Model):
    __tablename__ = 'class_names'
    __table_args__ = {'extend_existing': True}
    ID = Column(String, primary_key=True)  # class ID
    lanCode = Column(String, primary_key=True)
    name = Column(String)  # Human-readable name of this class


class Functions(db.Model):
    __tablename__ = 'functions'
    __table_args__ = {'extend_existing': True}
    ID = Column(String, primary_key=True)  # function ID
    classes = Column(String)  # class IDs of this function


class FunctionNames(db.Model):
    __tablename__ = 'function_names'
    __table_args__ = {'extend_existing': True}
    ID = Column(String, primary_key=True)  # function ID
    lanCode = Column(String, primary_key=True)
    name = Column(String)  # Human-readable name of this function


class FunctionPrompts(db.Model):
    __tablename__ = 'function_prompts'
    __table_args__ = {'extend_existing': True}
    functionID = Column(String, primary_key=True)  # function ID
    semanticID = Column(String, primary_key=True)
    lanCode = Column(String, primary_key=True)
    priority = Column(Integer)  # Priority rank
    model = Column(String)  # AI model name
    content = Column(String)  # Prompt contents
    author = Column(String)
    author_link = Column(String)
    copied_count = Column(Integer)


class PromptDialogs(db.Model):
    __tablename__ = 'prompt_dialogs'
    __table_args__ = {'extend_existing': True}
    functionID = Column(String, primary_key=True)  # function ID
    semanticID = Column(String, primary_key=True)
    lanCode = Column(String, primary_key=True)
    model = Column(String, primary_key=True)  # AI model name
    dialog_index = Column(Integer, primary_key=True)
    role_index = Column(Integer)
    content = Column(String)


class PromptView(db.Model):
    __tablename__ = 'prompt_view'
    __table_args__ = {'extend_existing': True}
    functionID = db.Column(db.String, primary_key=True)
    semanticID = db.Column(db.String, primary_key=True)
    lanCode = db.Column(db.String, primary_key=True)
    priority = db.Column(db.Integer)
    model = db.Column(db.String)
    content = db.Column(db.String)
    author = db.Column(db.String)
    author_link = db.Column(db.String)
    copied_count = db.Column(db.Integer)
    icon = db.Column(db.String)
    icon_style = db.Column(db.String)
    function_name = db.Column(db.String)
    dialog_count = db.Column(db.Integer)
