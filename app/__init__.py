import json

from flask import Flask
import sqlalchemy
from sqlalchemy import text


def create_app():
    app = Flask(__name__)
    app.config.from_file('app_config.json', json.load)

    from .models import db
    db.init_app(app)

    with app.app_context():
        db.create_all()
        with db.engine.connect() as connection:
            with connection.begin() as transaction:
                try:
                    connection.execute(text("""
                        DROP VIEW prompt_view 
                    """))
                except sqlalchemy.exc.OperationalError:
                    connection.execute(text("""
                        DROP TABLE prompt_view 
                    """))
                finally:
                    connection.execute(text("""
                        CREATE VIEW prompt_view AS
                        SELECT 
                            fp.*,
                            c.icon,
                            c.icon_style,
                            fn.name as function_name,
                            (SELECT COUNT(*) 
                                FROM prompt_dialogs pd 
                                WHERE pd.functionID = fp.functionID 
                                AND pd.semanticID = fp.semanticID 
                                AND pd.lanCode = fp.lanCode) as dialog_count
                        FROM function_prompts fp
                        JOIN functions f ON f.ID = fp.functionID
                        JOIN classes c ON c.ID = substr(f.classes, 1, instr(f.classes || ',', ',') - 1)
                        JOIN function_names fn ON fn.ID = fp.functionID AND fn.lanCode = fp.lanCode
                    """))

    from . import views
    from . import admin_views
    app.register_blueprint(views.bp)
    app.register_blueprint(admin_views.bp)
    app.config['TEMPLATES_AUTO_RELOAD'] = True

    views.login_manager.init_app(app)

    return app
