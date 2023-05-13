import re
from difflib import SequenceMatcher
import unicodedata
import os
import json

from sqlalchemy import and_, or_
from markdown2 import markdown

from app.models import *


def load_json_file(file_paths):
    with open(os.path.join(*file_paths), mode='r', encoding='utf-8') as fp:
        content = json.load(fp)
    return content


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

    # Use Levenshtein distance for all other languages

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


def get_prompt_info_for_render(p: dict):
    tmp = {}
    tmp['content'] = p['content']
    tmp['html'] = markdown(p['content'], extras=["fenced-code-blocks"])
    tmp['copied_count'] = p['copied_count']
    tmp['function_id']=p['functionID']
    tmp['semantic_id']=p['semanticID']
    tmp['author'] = p.get('author', '')
    if tmp['author'] == 'whm':
        tmp['author'] = ''
    tmp['author_link'] = p.get('author_link', '')
    tmp['model'] = p.get('model', 'GPT 3.5')
    try:
        tmp['function_desc'] = FunctionNames.query.filter(and_(
            FunctionNames.ID == p['function_id'], FunctionNames.lanCode == p['lan_code'])).first().name
    except:
        print(p['function_id'], p['lan_code'] )
    class_ids = Functions.query.filter(Functions.ID == p['function_id']).first().classes.split(',')
    classes = Classes.query.filter(Classes.ID.in_(class_ids)).all()
    tmp['class_list'] = [item.name for item in ClassNames.query.filter(and_(ClassNames.ID.in_(class_ids),
                                                                            ClassNames.lanCode == p['lan_code'])).all()]
    # get one class icon
    tmp['icon_style'] = classes[0].icon_style
    tmp['icon_name'] = classes[0].icon
    return tmp
