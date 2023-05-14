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


def gather_prompt_content_dict(prompt):
    return {'functionID': prompt.functionID, 'semanticID': prompt.semanticID, 'lanCode': prompt.lanCode,
            'priority': prompt.priority, 'model': prompt.model,
            'content': prompt.content, 'html': markdown(prompt.content, extras=["fenced-code-blocks"]),
            'author': prompt.author, 'author_link': prompt.author_link, 'copied_count': prompt.copied_count,
            'icon': prompt.icon, 'icon_style': prompt.icon_style, 
            'function_name': prompt.function_name, 'dialog_count': prompt.dialog_count}
