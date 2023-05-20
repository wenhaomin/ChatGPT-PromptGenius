import os
import copy
from datetime import datetime

from flask import Blueprint, jsonify, render_template, request, flash, redirect, url_for
from sqlalchemy import and_
from flask_login import LoginManager

from app.utils import *
from app.models import *


bp = Blueprint('views', __name__)
login_manager = LoginManager()


@bp.route('/')
def index():
    return render_template('index.html', lan_code=get_preferred_lancode())


@bp.route('/tools')
def tools():
    return render_template('tools.html', lan_code=get_preferred_lancode())


@bp.route('/log')
def log():
    return render_template('log.html', lan_code=get_preferred_lancode())


@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


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


@bp.route('/submit_function', methods=['GET', 'POST'])
def submit_function():
    if request.method == 'POST':
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

    # find all prompts that has the function
    for prompt in PromptView.query.filter(and_(PromptView.functionID.in_(function_ids),
                                               PromptView.lanCode.in_(lan_codes),
                                               PromptView.priority >= 0)
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
                                               PromptView.priority >= 0)).all():
        result.append(gather_prompt_content_dict(prompt))

    return jsonify({"content": result, "message": "success"})


@bp.route('/get_prompt_dialog/<function_id>/<semantic_id>/<lan_code>')
def get_prompt_dialog(function_id, semantic_id, lan_code):
    result = {}
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