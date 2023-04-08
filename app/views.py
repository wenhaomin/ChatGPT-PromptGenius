import copy
from datetime import datetime

from flask import Blueprint, jsonify, render_template, request

from app.utils import *
from app.models import *


bp = Blueprint('views', __name__)


@bp.route('/')
@bp.route('/index')
def index():
    return render_template('index.html')


@bp.route('/fetch_meta/<meta_name>')
def fetch_meta(meta_name):
    return jsonify({"content": meta[meta_name], "message": "success"})


@bp.route('/submit_function', methods=['GET', 'POST'])
def submit_function():
    if request.method == 'POST':
        try:
            func_desc = request.json['func_desc']
            prompt_content = request.json['prompt_content']
            user_name = request.json['user_name']
            cur_time = datetime.now().strftime('%Y_%m_%d_%H_%M_%S')

            new_function = SubmitFunction(funcDesc=func_desc, createTime=cur_time, promptContent=prompt_content, userName=user_name)
            db.session.add(new_function)
            db.session.commit()

            return jsonify({'message': 'success'})
        except Exception as e:
            print(e)
            return jsonify({'message': 'error', 'error': str(e)})


# By Haomin Wen
@bp.route('/fetch_tree/')
def fetch_tree():

    result = copy.deepcopy(classes_tree)

    return jsonify({"content": result, "message": "success"})


@bp.route('/fetch_prompt/<class_id>/<lan_code>')
def fetch_prompt(class_id, lan_code):
    result = []

    # find all funcions that has the class
    if class_id == 'all_class' or class_id == 'popular':
        f_lst = [f['function_id'] for f in functions]
    else:
        f_lst = [f['function_id'] for f in functions if class_id in f['class']]

    # find all prompts that has the function
    for data in prompts:
        fid = data['function_id']
        if fid not in f_lst:
            continue
        for p in data['content'][lan_code]:
            # prompt filter condition
            if class_id == 'popular' and int(p['priority']) != 2:
                continue  # priority=2, means popular

            tmp = get_prompt_info_for_render(fid, p, lan_code)

            result.append(tmp)
    return jsonify({"content": result, "message": "success"})


@bp.route('/search_prompt/<search_text>/<lan_code>')
def search_prompt(search_text, lan_code):
    result = []

    for data in prompts:
        fid = data['function_id']
        if fid not in functions_dict.keys():
            continue
        function_desc = functions_dict[fid]['desc'][lan_code]
        class_list = [name[lan_code] for name in fid_to_cnames[fid]]
        for p in data['content'][lan_code]:
            p_text = p['content'][0]

            # also take output the class label
            compare_text_lst = class_list + [p_text, function_desc]

            for c_text in compare_text_lst:
                score = text_similarity_score(search_text, c_text, lan_code)
                if score > 0.5:

                    tmp = get_prompt_info_for_render(fid, p, lan_code)

                    result.append(tmp)
                    continue
    return jsonify({"content": result, "message": "success"})
