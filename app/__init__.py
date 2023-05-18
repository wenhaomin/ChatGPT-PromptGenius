import json

from flask import Flask
from sqlalchemy import text


def create_app():
    app = Flask(__name__)
    app.config.from_file('app_config.json', json.load)

    from .models import db
    db.init_app(app)
    with app.app_context():
        with db.engine.connect() as connection:
            connection.execute(text("""
                    CREATE VIEW IF NOT EXISTS prompt_view AS
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
        db.create_all()
    from . import views
    app.register_blueprint(views.bp)
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.secret_key = b'+i\x12\xe3\x04 \x81\xb7\xa2T.{\xe3\x00H\\'

    return app
