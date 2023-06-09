from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, String, Integer
from werkzeug.security import generate_password_hash, check_password_hash

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
    childrens = Column(String, default='')  # class IDs of childrens, split by ','
    order = Column(Integer, default=0)


class ClassNames(db.Model):
    __tablename__ = 'class_names'
    __table_args__ = {'extend_existing': True}
    ID = Column(String, primary_key=True)  # class ID
    lanCode = Column(String, primary_key=True)
    name = Column(String)  # Human-readable name of this class
    order = Column(Integer, default=0)


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
    types = Column(String, default='normal')


class PromptDialogs(db.Model):
    __tablename__ = 'prompt_dialogs'
    __table_args__ = {'extend_existing': True}
    functionID = Column(String, primary_key=True)  # function ID
    semanticID = Column(String, primary_key=True)
    lanCode = Column(String, primary_key=True)
    model = Column(String, primary_key=True)  # AI model name
    model_index = Column(Integer, default=0)
    dialog_index = Column(Integer, primary_key=True)
    role_index = Column(Integer)
    content = Column(String)


class PromptView(db.Model):
    __tablename__ = 'prompt_view'
    __table_args__ = {'extend_existing': True}
    functionID = Column(String, primary_key=True)
    semanticID = Column(String, primary_key=True)
    lanCode = Column(String, primary_key=True)
    class_id = Column(String)
    priority = Column(Integer)
    model = Column(String)
    content = Column(String)
    author = Column(String)
    author_link = Column(String)
    copied_count = Column(Integer)
    icon = Column(String)
    icon_style = Column(String)
    function_name = Column(String)
    dialog_count = Column(Integer)
    types = Column(String)
