import re
from difflib import SequenceMatcher
import unicodedata
import os
import json

from sqlalchemy import and_, or_
from markdown2 import markdown

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
