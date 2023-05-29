from datetime import datetime

from flask import Blueprint, jsonify
import sqlalchemy
from sqlalchemy import and_, func, desc

from app.utils import *
from app.models import *


bp = Blueprint('admin_views', __name__)
db_datetime_format = '%Y_%m_%d_%H_%M_%S'
display_datetime_format = '%Y-%m-%d %H:%M:%S'

"""
Admin-specific routers: these routers are accessable only under Admin account.
"""


@bp.route('/edit_class_name', methods=['POST'])
@admin_required
def edit_class_name():
    class_id = request.json['class_id']
    lan_code = request.json['lan_code']
    class_name = request.json['class_name']

    class_entry = ClassNames.query.filter_by(ID=class_id, lanCode=lan_code).first()
    class_entry.name = class_name
    db.session.commit()

    return jsonify({'message': 'success'})


@bp.route('/edit_class_order', methods=['POST'])
@admin_required
def edit_class_order():
    class_orders = request.json['class_orders']

    for class_order in class_orders:
        class_entry = Classes.query.filter_by(ID=class_order['class_id']).first()
        class_entry.order = class_order['order']
    db.session.commit()

    return jsonify({'message': 'success'})


@bp.route('/edit_class_icon', methods=['POST'])
@admin_required
def edit_class_icon():
    class_id = request.json['class_id']
    icon = request.json['icon']
    icon_style = request.json['icon_style']

    class_entry = Classes.query.filter_by(ID=class_id).first()
    class_entry.icon = icon
    class_entry.icon_style = icon_style
    db.session.commit()

    return jsonify({'message': 'success'})


@bp.route('/remove_class', methods=['POST'])
@admin_required
def remove_class():
    class_id = request.json['class_id']

    if (len(Functions.query.filter(Functions.classes.contains(class_id)).all()) > 0):
        return jsonify({'message': 'fail'})

    for c in Classes.query.filter_by(ID=class_id).all():
        db.session.delete(c)
        for child_id in c.childrens.split(','):
            if len(child_id) > 0:
                for child_name_entry in ClassNames.query.filter_by(ID=child_id):
                    db.session.delete(child_name_entry)
    for class_name in ClassNames.query.filter_by(ID=class_id).all():
        db.session.delete(class_name)
    db.session.commit()
    return jsonify({'message': 'success'})


@bp.route('/add_parent_class', methods=['POST'])
@admin_required
def add_parent_class():
    class_names = request.json['class_names']
    icon = request.json['icon']
    icon_style = request.json['icon_style']

    cur_class_ids = [c.ID for c in ClassNames.query.all()]
    new_class_id = generate_random_string(8)
    while new_class_id in cur_class_ids:
        new_class_id = generate_random_string(8)

    new_class = Classes(ID=new_class_id, icon=icon, icon_style=icon_style, order=-1)
    db.session.add(new_class)
    for class_name in class_names:
        db.session.add(ClassNames(ID=new_class_id, lanCode=class_name['lan_code'], name=class_name['class_name']))
    db.session.commit()

    return jsonify({'message': 'success'})


@bp.route('/fetch_child_class', methods=['POST'])
@admin_required
def fetch_child_class():
    parent_id = request.json['parent_id']

    childrens = []
    for children_id in Classes.query.filter_by(ID=parent_id).first().childrens.split(','):
        if len(children_id) > 0:
            entries = ClassNames.query.filter_by(ID=children_id).all()
            children_names = {}
            for entry in entries:
                children_names[entry.lanCode] = entry.name
            childrens.append([children_id, children_names])
    return jsonify({'message': 'success', 'content': childrens})


@bp.route('/modify_child_class', methods=['POST'])
@admin_required
def modify_child_class():
    parent_id = request.json['parent_id']
    childrens = request.json['childrens']
    cur_class_ids = [c.ID for c in ClassNames.query.all()]

    parent_entry = Classes.query.filter_by(ID=parent_id).first()
    child_ids = []
    for children in childrens:
        if children['state'] == 'delete':
            if (len(Functions.query.filter(Functions.classes.contains(children['class_id'])).all()) > 0):
                return jsonify({'message': 'fail'})
            else:
                for name_entry in ClassNames.query.filter_by(ID=children['class_id']).all():
                    db.session.delete(name_entry)
        else:
            if children['state'] == 'new':
                child_id = parent_id + '-' + generate_random_string(6)
                while child_id in cur_class_ids:
                    child_id = parent_id + '-' + generate_random_string(6)
                for name in children['names']:
                    new_name_entry = ClassNames(ID=child_id, lanCode=name['lan_code'], name=name['name'])
                    db.session.add(new_name_entry)
            else:
                child_id = children['class_id']
                for name in children['names']:
                    name_entry = ClassNames.query.filter_by(ID=child_id, lanCode=name['lan_code']).first()
                    name_entry.name = name['name']
            child_ids.append(child_id)
    parent_entry.childrens = ','.join(child_ids)
    db.session.commit()

    return jsonify({'message': 'success'})


@bp.route('/delete_function', methods=['POST'])
@admin_required
def delete_function():
    function_id = request.json['function_id']

    if len(FunctionPrompts.query.filter_by(functionID=function_id).all()) > 0:
        return jsonify({'message': 'fail'})

    for entry in Functions.query.filter_by(ID=function_id).all():
        db.session.delete(entry)
    for entry in FunctionNames.query.filter_by(ID=function_id).all():
        db.session.delete(entry)
    db.session.commit()
    return jsonify({'message': 'success'})


@bp.route('/fetch_function_names', methods=['POST'])
@admin_required
def fetch_function_names():
    function_id = request.json['function_id']
    function_names = []
    for entry in FunctionNames.query.filter_by(ID=function_id).all():
        function_names.append({'lan_code': entry.lanCode, 'name': entry.name})

    return jsonify({'message': 'success', 'content': function_names})


@bp.route('/fetch_function_class_tags', methods=['POST'])
@admin_required
def fetch_function_class_tags():
    function_id = request.json['function_id']
    lan_code = request.json['lan_code']
    class_tags = []
    for class_id in Functions.query.filter_by(ID=function_id).first().classes.split(','):
        class_tags.append({'class_id': class_id,
                           'class_name': ClassNames.query.filter_by(ID=class_id, lanCode=lan_code).first().name})
    return jsonify(class_tags)


@bp.route('/edit_function_meta', methods=['POST'])
@admin_required
def edit_function_meta():
    function_id = request.json['function_id']
    function_names = request.json['function_names']
    class_tags = request.json['class_tags']

    try:
        for function_name in function_names:
            entry = FunctionNames.query.filter_by(ID=function_id, lanCode=function_name['lan_code']).first()
            entry.name = function_name['name']
        entry = Functions.query.filter_by(ID=function_id).first()
        entry.classes = ','.join(class_tags)

        db.session.commit()
    except Exception as e:
        return jsonify({'message': 'fail', 'error': str(e)})
    return jsonify({'message': 'success', 'function-id': function_id})


@bp.route('/add_function', methods=['POST'])
@admin_required
def add_function():
    function_names = request.json['function_names']
    class_tags = request.json['class_tags']

    cur_function_ids = [item.ID for item in Functions.query.all()]
    new_function_id = generate_random_string(16)
    while new_function_id in cur_function_ids:
        new_function_id = generate_random_string(16)

    try:
        new_function = Functions(ID=new_function_id, classes=','.join(class_tags))
        db.session.add(new_function)
        for function_name in function_names:
            new_name = FunctionNames(ID=new_function_id, lanCode=function_name['lan_code'], 
                                     name=function_name['name'])
            db.session.add(new_name)
        db.session.commit()
    except Exception as e:
        return jsonify({'message': 'fail', 'error': str(e)})

    return jsonify({'message': 'success', 'function_id': new_function_id})


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


@bp.route('/fetch_functions_with_class', methods=['POST'])
@admin_required
def fetch_functions_with_class():
    class_id = request.json['class_id']
    lan_code = request.json['lan_code']

    function_ids = [item.ID for item in Functions.query.with_entities(Functions.ID).filter(
        Functions.classes.contains(class_id)).all()]
    function_names = []
    for function_id in function_ids:
        name_entries = FunctionNames.query.with_entities(
            FunctionNames.name).filter_by(ID=function_id, lanCode=lan_code).all()
        if len(name_entries) > 0:
            function_names.append([function_id, name_entries[0].name])

    return jsonify({'message': 'success', 'content': function_names})


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

    try:
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

        if function_id != function_id_new or semantic_id != semantic_id_new or lan_code != lan_code_new:
            user_fav_prompts = UserFavPrompt.query.filter_by(
                functionID=function_id, semanticID=semantic_id, lanCode=lan_code).all()
            for p in user_fav_prompts:
                p.functionID = function_id_new
                p.semanticID = semantic_id_new
                p.lanCode = lan_code_new

            prompt_dialogs = PromptDialogs.query.filter_by(
                functionID=function_id, semanticID=semantic_id, lanCode=lan_code).all()
            for p in prompt_dialogs:
                p.functionID = function_id_new
                p.semanticID = semantic_id_new
                p.lanCode = lan_code_new

        db.session.commit()
    except Exception as e:
        return jsonify({'message': 'fail', 'error': str(e)})

    return jsonify({'message': 'success'})


@bp.route('/add_prompt', methods=['POST'])
@admin_required
def add_prompt():
    function_id = request.json['function_id']
    semantic_id = request.json['semantic_id']
    lan_code = request.json['lan_code']
    priority = request.json['priority']
    model = request.json['model']
    author = request.json['author']
    author_link = request.json['author_link']
    content = request.json['content']

    try:
        new_prompt = FunctionPrompts(functionID=function_id, semanticID=semantic_id, lanCode=lan_code,
                                     priority=priority, model=model, author=author, author_link=author_link,
                                     content=content, copied_count=0)
        db.session.add(new_prompt)
        db.session.commit()
    except sqlalchemy.exc.IntegrityError as e:
        return jsonify({'message': 'fail', 'error': str(e)})
    return jsonify({'message': 'success'})


@bp.route('/remove_prompt', methods=['POST'])
@admin_required
def remove_prompt():
    function_id = request.json['function_id']
    semantic_id = request.json['semantic_id']
    lan_code = request.json['lan_code']

    try:
        for p in FunctionPrompts.query.filter_by(functionID=function_id,
                                                 semanticID=semantic_id,
                                                 lanCode=lan_code).all():
            db.session.delete(p)
        for p in UserFavPrompt.query.filter_by(functionID=function_id,
                                               semanticID=semantic_id,
                                               lanCode=lan_code).all():
            db.session.delete(p)
        for p in PromptDialogs.query.filter_by(functionID=function_id,
                                               semanticID=semantic_id,
                                               lanCode=lan_code).all():
            db.session.delete(p)
        db.session.commit()
    except Exception as e:
        return jsonify({'message': 'fail', 'error': str(e)})
    return jsonify({'message': 'success'})


@bp.route('/edit_prompt_examples', methods=['POST'])
@admin_required
def edit_prompt_examples():
    function_id = request.json['function_id']
    semantic_id = request.json['semantic_id']
    lan_code = request.json['lan_code']

    try:
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
    except Exception as e:
        return jsonify({'message': 'fail', 'error': str(e)})

    return jsonify({'message': 'success'})


@bp.route('/fetch_user_submits/<show_archived>')
@admin_required
def fetch_user_submits(show_archived):
    submits = []
    for submit in SubmitFunction.query.filter(SubmitFunction.archived == int(show_archived)).order_by(desc(SubmitFunction.createTime)).all():
        submits.append({'func': submit.funcDesc,
                        'disp_time': datetime.strptime(submit.createTime, db_datetime_format).strftime(display_datetime_format),
                        'db_time': submit.createTime,
                        'content': md_to_html(submit.promptContent),
                        'raw_content': submit.promptContent,
                        'user': submit.userName})
    return jsonify({'message': 'success', 'content': submits})


@bp.route('/delete_user_submit', methods=['POST'])
@admin_required
def delete_user_submit():
    func = request.json['func']
    time = request.json['time']

    submit = SubmitFunction.query.filter_by(funcDesc=func, createTime=time).first()
    db.session.delete(submit)
    db.session.commit()

    return jsonify({'message': 'success'})


@bp.route('/archive_user_submit', methods=['POST'])
@admin_required
def archive_user_submit():
    func = request.json['func']
    time = request.json['time']

    submit = SubmitFunction.query.filter_by(funcDesc=func, createTime=time).first()
    submit.archived = 1
    db.session.commit()

    return jsonify({'message': 'success'})