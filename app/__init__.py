import json

from flask import Flask


def create_app():
    app = Flask(__name__)
    app.config.from_file('app_config.json', json.load)

    from .models import db
    db.init_app(app)
    with app.app_context():
        db.create_all()
    from app.views import login_manager
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    from . import views
    app.register_blueprint(views.bp)
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.secret_key = b'+i\x12\xe3\x04 \x81\xb7\xa2T.{\xe3\x00H\\'

    return app
