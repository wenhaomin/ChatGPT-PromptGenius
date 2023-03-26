from flask import Flask


def create_app():
    app = Flask(__name__)

    from . import views
    app.register_blueprint(views.bp)
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.secret_key = b'+i\x12\xe3\x04 \x81\xb7\xa2T.{\xe3\x00H\\'

    return app
