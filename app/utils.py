import os
import json


def load_json_file(file_paths):
    with open(os.path.join(*file_paths), mode='r', encoding='utf-8') as fp:
        content = json.load(fp)
    return content


import unicodedata
# import jieba
# from pyjarowinkler import distance
from difflib import SequenceMatcher

# todo: add chinese search

import re

def is_contain_string(a, b):
    regex_pattern = fr'.*{a}.*'
    regex = re.compile(regex_pattern)
    return regex.match(b)


def text_similarity_score(A, B, lang):
    # Normalize the input strings for Unicode consistency
    A = unicodedata.normalize('NFC', A)
    B = unicodedata.normalize('NFC', B)

    # key word match
    if (is_contain_string(A, B) or is_contain_string(B, A)):
        return 1

    #Use Levenshtein distance for all other languages

    A = A.replace('　', ' ')
    B = B.replace('　', ' ')
    score = similarity_score_levenshtein(A, B)
    return score


def similarity_score_levenshtein(A, B):
    # Calculate the similarity ratio using the Levenshtein distance algorithm
    A = A.lower()
    B = B.lower()
    matcher = SequenceMatcher(None, A, B)
    ratio = matcher.ratio()
    return ratio


def get_prompt_info_for_render(fid: str, p: dict, lan_code: str):
    tmp = {}
    tmp['chat_list'] = [p['content']]
    tmp['class_list'] = [name[lan_code] for name in fid_to_cnames[fid]]  # get class names
    tmp['author'] = p.get('author', '')
    if tmp['author'] == 'whm': tmp['author'] = ''
    tmp['author_link'] = p.get('author_link', '')
    tmp['model'] = p.get('model', 'GPT 3.5')
    tmp['function_desc'] = functions_dict[fid]['desc'][lan_code]

    # get one class icon
    tmp['icon_style'] = 'mdui-icon material-icons mdui-text-color-blue'
    tmp['icon_name'] = 'lightbulb_outline'
    cid_lst = functions_dict[fid]['class']
    for cid in cid_lst:
        cid_style = cid_to_icon_style.get(cid, None)
        cid_name = cid_to_icon_name.get(cid, None)
        if (cid_name is not None) and (cid_style is not None):
            tmp['icon_style'] = cid_style
            tmp['icon_name'] = cid_name

    return  tmp


meta = load_json_file(['data', 'meta.json'])
functions = load_json_file(['data', 'functions.json'])
prompts = load_json_file(['data', 'prompts.json'])
classes_tree = load_json_file(['data', 'class_tree.json'])

# get function dict:
functions_dict = {f['function_id']: f for f in functions}

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


# class id to icon_name, style
cid_to_icon_name = {}
cid_to_icon_style = {}
def get_cicon_dict(d):
    cid = d['id']
    icon_style = d.get('icon_style', None)
    icon_name = d.get('icon_name', None)
    if icon_name is not None:
        cid_to_icon_name[cid] = icon_name
        cid_to_icon_style[cid] = icon_style

    children = d.get('children', None)
    if children is not None:
        for c in children:
            get_cicon_dict(c)

for c in classes_tree:
    get_cicon_dict(c)

# function id to class name
# {'function_id': [{"eng": Code Development, "chn": "代码开发"}, ...]}
fid_to_cnames = {}
for f in functions:
    fid = f['function_id']
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
        fid = f['function_id']
        for c in c_lst:
            c_f_dict[c].add(fid)


    # change the function class
    for f in functions:
        f['class'].append(f['function_id'])

   
    # change the class tree, mount the function as the second class 
    def mount_function_in_class_tree(d: dict):
        cid = d['id']
        # print('##', cid_to_cnames[cid]['chn'])
        if cid == 'office': return 0# do not conduct for office
        children_lst = []
        fid_lst = c_f_dict.get(cid, [])
        for fid in fid_lst:
            # print('###', functions_dict[fid]['desc']['chn'])
            names = functions_dict[fid]['desc']
            tmp = {'id': fid, 'names': names}
            children_lst.append(tmp)
        d['children'] = children_lst
    
    for c in classes_tree:
        mount_function_in_class_tree(c)