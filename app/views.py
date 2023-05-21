import os
import copy
from datetime import datetime

from flask import Blueprint, jsonify, render_template
from sqlalchemy import and_, func
from flask_login import LoginManager, login_user, login_required, logout_user

from app.utils import *
from app.models import *


bp = Blueprint('views', __name__)
login_manager = LoginManager()


"""
Routers for different pages.
"""


@bp.route('/')
def index():
    return render_template('index.html',
                           lan_code=get_preferred_lancode(),
                           username=get_cur_username(),
                           show_edit_content=is_admin())


@bp.route('/tools')
def tools():
    return render_template('tools.html',
                           lan_code=get_preferred_lancode(),
                           username=get_cur_username(),
                           show_edit_content=is_admin())


@bp.route('/log')
def log():
    return render_template('log.html',
                           lan_code=get_preferred_lancode(),
                           username=get_cur_username(),
                           show_edit_content=is_admin())


@login_manager.user_loader
def load_user(user_id):
    return User.query.filter(User.id == user_id).first()


"""
Routers for user managements: login, register and logout.
"""


@bp.route('/login', methods=['POST'])
def login():
    username = request.json['username']
    password = request.json['password']

    user = User.query.filter(User.username == username).first()

    if user and user.check_password(password):
        login_user(user)
        return jsonify({'message': 'success', 'username': user.username})
    else:
        return jsonify({'message': 'fail'})


@bp.route('/register', methods=['POST'])
def register():
    username = request.json['username']
    password = request.json['password']

    existing_user = User.query.filter(User.username == username).first()
    if existing_user:
        return jsonify({'message': 'fail'})

    cur_max_id = db.session.query(func.max(User.id)).scalar()
    new_user = User(id=(cur_max_id + 1) if cur_max_id is not None else 0, username=username)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    login_user(new_user)
    return jsonify({'message': 'success', 'username': new_user.username})


@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'success'})


"""
User-specific routers: change user settings, add or remove favorites.
"""


@bp.route('/change_password', methods=['POST'])
@login_required
def change_password():
    user = current_user
    old_password = request.json['old_password']
    new_password = request.json['new_password']

    if user.check_password(old_password):
        user.set_password(new_password)
        db.session.commit()
        return jsonify({'message': 'success'})
    else:
        return jsonify({'message': 'fail'})


@bp.route('/add_fav_prompt', methods=['POST'])
@login_required
def add_fav_prompt():
    function_id = request.json['function_id']
    semantic_id = request.json['semantic_id']
    lan_code = request.json['lan_code']

    cur_user_id = current_user.id
    cur_max_id = db.session.query(func.max(UserFavPrompt.favID)).filter(
        UserFavPrompt.userID == cur_user_id).scalar()
    new_fav = UserFavPrompt(userID=cur_user_id,
                            favID=(cur_max_id + 1) if cur_max_id is not None else 0,
                            functionID=function_id, semanticID=semantic_id, lanCode=lan_code)
    db.session.add(new_fav)
    db.session.commit()

    return jsonify({'message': 'success'})


@bp.route('/remove_fav_prompt', methods=['POST'])
@login_required
def remove_fav_prompt():
    function_id = request.json['function_id']
    semantic_id = request.json['semantic_id']
    lan_code = request.json['lan_code']

    cur_user_id = current_user.id
    fav_item = UserFavPrompt.query.filter(and_(UserFavPrompt.userID == cur_user_id,
                                               UserFavPrompt.functionID == function_id,
                                               UserFavPrompt.semanticID == semantic_id,
                                               UserFavPrompt.lanCode == lan_code)).all()
    for item in fav_item:
        db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'success'})


@bp.route('/fetch_fav_prompt')
@login_required
def fetch_fav_prompt():
    cur_user_id = current_user.id
    fav_prompts = UserFavPrompt.query.filter(UserFavPrompt.userID == cur_user_id).all()
    prompt_indicators = [{'function_id': item.functionID, 'semantic_id': item.semanticID, 'lan_code': item.lanCode}
                         for item in fav_prompts]
    return jsonify({'message': 'success', 'content': prompt_indicators})


"""
Routers for fetching various contents.
"""


@bp.route('/fetch_lan')
def fetch_lan():
    languages = [{"code": item.code, "name": item.name} for item in Languages.query.all()]
    return jsonify(languages)


@bp.route('/fetch_tools/<lan_code>')
def fetch_tools(lan_code):
    if lan_code != 'chn':
        lan_code = 'eng'
    tools = [{'name': item.name, 'desc': item.desc, 'url': item.url,
              'icon_src': item.icon_src, 'tags': item.tags.split(',')}
             for item in Tools.query.filter(Tools.lanCode == lan_code).all()]
    return jsonify(tools)


@bp.route('/fetch_classes/<lan_code>')
def fetch_classes(lan_code):
    class_names = {item.ID: item.name
                   for item in ClassNames.query.filter(ClassNames.lanCode == lan_code).all()}
    classes = [{'ID': item.ID, 'name': class_names[item.ID],
                'childrens': [{'ID': child, 'name': class_names[child]} for child in item.childrens.split(',')]
                if item.childrens is not None else [],
                'icon': item.icon, 'icon_style': item.icon_style}
               for item in Classes.query.all()]
    return jsonify(classes)


@bp.route('/fetch_prompt/<class_id>/<lan_code>')
def fetch_prompt(class_id, lan_code):
    lan_codes = [lan_code]
    if lan_code not in ['chn', 'eng']:
        lan_codes.append('eng')

    result = []
    function_ids = [item.functionID
                    for item in FunctionPrompts.query.with_entities(FunctionPrompts.functionID).all()]

    # find all funcions that has the class
    if class_id == 'all_class' or class_id == 'popular':
        function_ids = [item.functionID
                        for item in FunctionPrompts.query.with_entities(FunctionPrompts.functionID).all()]
    else:
        function_ids = [item.ID
                        for item in Functions.query.with_entities(Functions.ID).
                        filter(Functions.classes.contains(class_id)).all()]

    if class_id == 'user_fav' and current_user.is_authenticated:
        fav_prompts = UserFavPrompt.query.filter(UserFavPrompt.userID == current_user.id).all()
        for prompt in [PromptView.query.filter(and_(PromptView.functionID == item.functionID,
                                                    PromptView.semanticID == item.semanticID,
                                                    PromptView.lanCode == item.lanCode)).first() for item in fav_prompts]:
            result.append(gather_prompt_content_dict(prompt))
    else:
        # find all prompts that has the function
        for prompt in PromptView.query.filter(and_(PromptView.functionID.in_(function_ids),
                                                   PromptView.lanCode.in_(lan_codes),
                                                   PromptView.priority >= (-999 if is_admin() else 0))
                                              ).all():
            if class_id == 'popular' and int(prompt.priority) != 2:
                continue
            result.append(gather_prompt_content_dict(prompt))

    return jsonify({"content": result, "message": "success"})


@bp.route('/search_prompt/<search_text>/<lan_code>')
def search_prompt(search_text, lan_code):
    lan_codes = [lan_code]
    if lan_code not in ['chn', 'eng']:
        lan_codes.append('eng')

    result = []

    for prompt in PromptView.query.filter(and_(PromptView.content.contains(search_text),
                                               PromptView.lanCode.in_(lan_codes),
                                               PromptView.priority >= (-999 if is_admin() else 0))).all():
        result.append(gather_prompt_content_dict(prompt))

    return jsonify({"content": result, "message": "success"})


@bp.route('/get_prompt_dialog', methods=['POST'])
def get_prompt_dialog():
    result = {}
    function_id = request.json['function_id']
    semantic_id = request.json['semantic_id']
    lan_code = request.json['lan_code']
    for dialog in PromptDialogs.query.filter(and_(PromptDialogs.functionID == function_id,
                                                  PromptDialogs.semanticID == semantic_id,
                                                  PromptDialogs.lanCode == lan_code)).\
            order_by(PromptDialogs.model, PromptDialogs.dialog_index).all():
        content_html = markdown(dialog.content, extras=["fenced-code-blocks", "tables"])
        result.setdefault(dialog.model, []).append({'html': content_html, 'raw': dialog.content,
                                                    'role': dialog.role_index})
    return jsonify({'content': result, 'count': len(result), 'message': 'success'})


@bp.route('/fetch_logs/<lan_code>')
def fetch_logs(lan_code):
    if lan_code != 'chn':
        lan_code = 'eng'

    log_dir = os.path.join('app', 'logs', lan_code)
    file_list = []
    for root, dirs, files in os.walk(log_dir):
        for file in files:
            if file.endswith('.md'):
                file_list.append(file)
    contents = []
    for file in sorted(file_list):
        with open(os.path.join(log_dir, file), 'r', encoding='utf-8') as fp:
            md_text = fp.read()
        contents.append(md_to_html(md_text))

    return jsonify({'message': 'success', 'content': contents})


"""
Routers for users' interactions with the website.
"""


@bp.route('/increase_popularity', methods=['GET', 'POST'])
def increase_popularity():
    if request.method == 'POST':
        try:
            functionprompt = FunctionPrompts.query.filter_by(
                lanCode=request.json['lan_code'],
                functionID=request.json['function_id'],
                semanticID=request.json['semantic_id']).first()
            if functionprompt:
                functionprompt.copied_count += request.json['increase']
                db.session.commit()
            return jsonify({'message': 'success'})
        except Exception as e:
            print(e)
            return jsonify({'message': 'error', 'error': str(e)})


@bp.route('/submit_function', methods=['POST'])
def submit_function():
    try:
        func_desc = request.json['func_desc']
        prompt_content = request.json['prompt_content']
        user_name = request.json['user_name']
        cur_time = datetime.now().strftime('%Y_%m_%d_%H_%M_%S')

        new_function = SubmitFunction(funcDesc=func_desc, createTime=cur_time,
                                      promptContent=prompt_content, userName=user_name)
        db.session.add(new_function)
        db.session.commit()

        return jsonify({'message': 'success'})
    except Exception as e:
        print(e)
        return jsonify({'message': 'error', 'error': str(e)})


"""
Admin-specific routers: these routers are accessable only under Admin account.
"""


@bp.route('/fetch_prompt_meta', methods=['POST'])
@admin_required
def fetch_prompt_meta():
    function_id = request.json['function_id']
    semantic_id = request.json['semantic_id']
    lan_code = request.json['lan_code']

    prompt = PromptView.query.filter(and_(PromptView.functionID == function_id,
                                          PromptView.semanticID == semantic_id,
                                          PromptView.lanCode == lan_code)).first()
    prompt_meta = gather_prompt_content_dict(prompt)

    return jsonify({'message': 'success', 'meta': prompt_meta})


@bp.route('/edit_prompt_meta', methods=['POST'])
@admin_required
def edit_prompt_meta():
    function_id = request.json['function_id']
    semantic_id = request.json['semantic_id']
    lan_code = request.json['lan_code']

    function_id_new = request.json['function_id_new']
    semantic_id_new = request.json['semantic_id_new']
    lan_code_new = request.json['lan_code_new']
    priority = request.json['priority']
    model = request.json['model']
    author = request.json['author']
    author_link = request.json['author_link']
    content = request.json['content']

    prompt = FunctionPrompts.query.filter(and_(FunctionPrompts.functionID == function_id,
                                               FunctionPrompts.semanticID == semantic_id,
                                               FunctionPrompts.lanCode == lan_code)).first()
    prompt.functionID = function_id_new
    prompt.semanticID = semantic_id_new
    prompt.lanCode = lan_code_new
    prompt.priority = priority
    prompt.model = model
    prompt.author = author
    prompt.author_link = author_link
    prompt.content = content

    db.session.commit()

    return jsonify({'message': 'success'})


@bp.route('/edit_prompt_dialog', methods=['POST'])
@admin_required
def edit_prompt_dialog():
    function_id = request.json['function_id']
    semantic_id = request.json['semantic_id']
    lan_code = request.json['lan_code']

    for dialog in PromptDialogs.query.filter_by(functionID=function_id,
                                                semanticID=semantic_id,
                                                lanCode=lan_code).all():
        db.session.delete(dialog)

    examples = request.json['examples']
    for model_name, example_contents in examples.items():
        for index, content, role in example_contents:
            new_item = PromptDialogs(functionID=function_id, semanticID=semantic_id, 
                                     lanCode=lan_code, model=model_name, 
                                     dialog_index=index, role_index=role, content=content)
            db.session.add(new_item)
    db.session.commit()

    return jsonify({'message': 'success'})