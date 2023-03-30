import copy

from flask import Blueprint, jsonify, render_template

from app.utils import *


bp = Blueprint('views', __name__)


meta = load_json_file(['data', 'meta.json'])
functions = load_json_file(['data', 'functions.json'])
prompts = load_json_file(['data', 'prompts.json'])
classes_tree = load_json_file(['data', 'class_tree.json'])

# print([f['function'] for f in functions])


# get function dict:
functions_dict = {f['function']: f for f in functions}


# class id to names,
cid_to_cnames = {}
def get_cname_dict(d):
    id = d['id']
    cnames = d['names']
    cid_to_cnames[id] = cnames
    children = d.get('children', None)
    if children is not None:
        for c in children:
            get_cname_dict(c)

for c in classes_tree:
    get_cname_dict(c)

# function id to class name
# {'function_id': [{"eng": Code Development, "chn": "代码开发"}, ...]}
fid_to_cnames = {}
for f in functions:
    fid = f['function']
    cid_lst = f['class'] # a function can have many classes
    cnames_lst = [cid_to_cnames[cid] for cid in cid_lst]
    fid_to_cnames[fid] = cnames_lst


is_function_in_class_tree = True
if is_function_in_class_tree:

     # build class_function_dict
    from collections import defaultdict
    c_f_dict = defaultdict(set)
    for f in functions:
        c_lst = f['class']
        fid = f['function']
        for c in c_lst:
            c_f_dict[c].add(fid)


    # change the function class
    for f in functions:
        f['class'].append(f['function'])

   
    # change the class tree, mount the function as the second class 
    def mount_function_in_class_tree(d: dict):
        cid = d['id']
        if cid == 'office': return 0# do not conduct for office
        children_lst = []
        fid_lst = c_f_dict.get(cid, [])
        for fid in fid_lst:
            names = functions_dict[fid]['desc']
            tmp = {'id': fid, 'names': names}
            children_lst.append(tmp)
        d['children'] = children_lst
    
    for c in classes_tree:
        mount_function_in_class_tree(c)


@bp.route('/')
@bp.route('/index')
def index():
    return render_template('index.html')


@bp.route('/fetch_meta/<meta_name>')
def fetch_meta(meta_name):
    return jsonify({"content": meta[meta_name], "message": "success"})


# @bp.route('/fetch_class/<param>')
# def fetch_class(param):
#     if param == 'with_example':
#         result = []
#         for item in copy.deepcopy(classes):
#             one_class = item
#             class_id = one_class['id']
#             for function in functions: # 遍历所有的function，找到属于某个class的function
#                 if class_id in function['class']:
#                     one_class['example'] = function
#                     break
#             result.append(one_class)
#     elif param == 'raw':
#         result = classes
#     else:
#         return jsonify({"message": f'Invalid parameter "{param}"'})
#     return jsonify({"content": result, "message": "success"})


# @bp.route('/fetch_meta/<meta_name>')
# def fetch_class_(meta_name):
#     return jsonify({"content": meta[meta_name], "message": "success"})


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
        f_lst = [f['function'] for f in functions]
    else:
        f_lst = [f['function'] for f in functions if class_id in f['class']]

    # find all prompts that has the function
    for data in prompts:
        fid = data['function']
        if fid not in f_lst: continue
        for p in data['content'][lan_code]:
            # todo: prompt filter condition
            
            if class_id=='popular' and p['priority'] != 2: continue  # priority=2, means popular

            tmp = {}
            tmp['chat_list'] =  p['content'] #todo: change later
            tmp['class_list'] = [name[lan_code] for name in fid_to_cnames[fid]] # get class names
            tmp['author'] = p.get('author', '')
            tmp['author_link'] = p.get('author_link', '')
            tmp['model'] = p.get('model', 'GPT 3.5')
            tmp['function_desc'] = functions_dict[fid]['desc'][lan_code]
            #priority_check todo: excute the priority check here
            result.append(tmp)
    return jsonify({"content": result, "message": "success"})




@bp.route('/search_prompt/<search_text>/<lan_code>')
def search_prompt(search_text, lan_code):
    result = []

    for data in prompts:
        fid = data['function']
        function_desc = functions_dict[fid]['desc'][lan_code]
        class_list = [name[lan_code] for name in fid_to_cnames[fid]] 
        for p in data['content'][lan_code]:
            p_text = p['content'][0]

            # also take output the class label
            compare_text_lst = class_list + [p_text, function_desc]

            for c_text in compare_text_lst:
                score  = text_similarity_score(search_text, c_text, lan_code)
                if score > 0.5:
                    tmp = {}
                    tmp['chat_list'] = p['content']  # todo: change later
                    tmp['class_list'] = class_list  # get class names
                    tmp['author'] = p.get('author', '')
                    tmp['author_link'] = p.get('author_link', '')
                    tmp['model'] = p.get('model', 'GPT 3.5')
                    tmp['function_desc'] = function_desc
                    result.append(tmp)
                    continue
    return jsonify({"content": result, "message": "success"})


# remove duplicate value

# one function can have many class. Add a class, popular: 
# 1) add  popular in classes.json
# {
#     "id": "popular",
#     "names": {
#         "chn": "popular",
#         "eng": "popular",
#         "jpn": "popular",
#         "fra": "popular",
#         "kor": "popular",
#         "deu": "popular"
#     }
# },



# 3) add popular into the class_level.json
#  {
#         "id": "popular",
#         "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
#         "icon_name": "code",
#         "names": {
#             "chn": "popular",
#             "eng": "popular",
#             "jpn": "popular",
#             "fra": "popular",
#             "kor": "popular",
#             "deu": "popular"
#         }
#     },

# 3) add popular data into prompts.json
# solutioin 2: change the  fetch_prompt function, iter all prompts to check its priority, if priority = 2, it is popular
# priority = 0, normal 
# priority = 1, good, 
# priority = 2, popular
# priority = 3, precious, do do show


















