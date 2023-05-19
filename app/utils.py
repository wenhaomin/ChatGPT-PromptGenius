from markdown2 import markdown
from flask import request

from app.models import *


def gather_prompt_content_dict(prompt):
    return {'functionID': prompt.functionID, 'semanticID': prompt.semanticID, 'lanCode': prompt.lanCode,
            'priority': prompt.priority, 'model': prompt.model,
            'content': prompt.content, 'html': md_to_html(prompt.content),
            'author': prompt.author, 'author_link': prompt.author_link, 'copied_count': prompt.copied_count,
            'icon': prompt.icon, 'icon_style': prompt.icon_style,
            'function_name': prompt.function_name, 'dialog_count': prompt.dialog_count}


def md_to_html(md):
    return markdown(md, extras=["fenced-code-blocks", "tables"])


def get_preferred_lancode():
    user_languages = request.accept_languages
    lan_codes = {'zh': 'chn', 'en': 'eng', 'ja': 'jpn', 'ko': 'kor', 'de': 'deu'}
    preferred_language = user_languages.best_match(lan_codes.keys())
    preferred_lan_code = lan_codes.get(preferred_language, 'eng')
    return preferred_lan_code