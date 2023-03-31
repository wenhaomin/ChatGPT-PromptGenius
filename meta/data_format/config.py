# -*- coding: utf-8 -*-
from easydict import EasyDict as edict

config = edict()
config.supported_languages = ['chn', 'eng', 'jpn', 'kor', 'deu']#'chn', 'eng', 'jpn', 'kor', 'deu'


config.lang_name_to_code = {
    "English": "eng",
    "Chinese": "chn",
    "Spanish": "spa",
    "Hindi": "hin",
    "Arabic": "ara",
    "Bengali": "ben",
    "Portuguese": "por",
    "Russian": "rus",
    "Japanese": "jpn",
    "Punjabi": "pan",
    "Korean": "kor",
    "German": "deu",
    "French": "fra"
}


config.class_name = {
    "popular":
        {
            'chn': '精选',
            'eng': 'Popular',
            'jpn': '人気',
            'fra': 'Populaire',
            'kor': '인기 있는',
            'deu': 'Beliebt',
        },
    'office':
        {
            'chn': 'Microsoft Office',
            'eng': 'Microsoft Office',
            'jpn': 'Microsoft Office',
            'fra': 'Microsoft Office',
            'kor': 'Microsoft Office',
            'deu': 'Microsoft Office',
        },


    'MicrosoftExcel': {
        'chn': 'Excel',
        'eng': 'Excel',
        'jpn': 'Excel',
        'fra': 'Excel',
        'kor': 'Excel',
        'deu': 'Excel',
    },

    'MicrosoftOneNote': {
        'chn': 'OneNote',
        'eng': 'OneNote',
        'jpn': 'OneNote',
        'fra': 'OneNote',
        'kor': 'OneNote',
        'deu': 'OneNote',
    },

    'MicrosoftPowerPoint': {
        'chn': 'PowerPoint',
        'eng': 'PowerPoint',
        'jpn': 'PowerPoint',
        'fra': 'PowerPoint',
        'kor': 'PowerPoint',
        'deu': 'PowerPoint',
    },

    'MicrosoftWord': {
        'chn': 'Word',
        'eng': 'Word',
        'jpn': 'Word',
        'fra': 'Word',
        'kor': 'Word',
        'deu': 'Word',
    },

    'code_development': {
        'chn': '代码开发',
        'eng': 'Code Development',
        'jpn': 'コード開発',
        'fra': 'Développement de code',
        'kor': '코드 개발',
        'deu': 'Code-Entwicklung'
    },
    'leisure_and_entertainment': {
        'chn': '休闲娱乐',
        'eng': 'Entertainment',
        'jpn': 'カジュアル',
        'fra': 'Loisirs et divertissements',
        'kor': '레저 및 엔터테인먼트',
        'deu': 'Freizeit und Unterhaltung'
    },
    'study_tutoring': {
        'chn': '学业辅导',
        'eng': 'Study Tutoring',
        'jpn': 'がくしゅう',
        'fra': 'Tutorat universitaire',
        'kor': '학업 지도',
        'deu': 'Akademische Nachhilfe'
    },
    'teacher_education': {
        'chn': '教师教学',
        'eng': 'Teacher Education',
        'jpn': '教師教育',
        'fra': 'Formation des enseignants',
        'kor': '교사 교육',
        'deu': 'Lehrerausbildung'
    },
    'copywriting_generation': {
        'chn': '文案生成',
        'eng': 'Text Generation',
        'jpn': 'コピーライティング',
        'fra': 'Rédaction publicitaire',
        'kor': '콘텐츠 작성',
        'deu': 'Texterstellung'
    },
    'gift_selection': {
        'chn': '礼物挑选',
        'eng': 'Gift Selection',
        'jpn': 'ギフト選択',
        'fra': 'Sélection de cadeaux',
        'kor': '선물 선택',
        'deu': 'Geschenkauswahl'
    },
    'research_assistance': {
        'chn': '科研帮助',
        'eng': 'Research Assistance',
        'jpn': '研究支援',
        'fra': 'Assistance à la recherche',
        'kor': '연구 지원',
        'deu': 'Forschungsunterstützung'
    },
    'language_learning': {
        'chn': '语言学习',
        'eng': 'Language Learning',
        'jpn': '言語学習',
        'fra': 'Apprentissage des langues',
        'kor': '언어 학습',
        'deu': 'Sprachtraining'
    }
}

config.class_icon = {
    "popular":{
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-red",
        "icon_name": "thumb_up",
    },
    'office': {"icon_style":"mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
               "icon_name":"widgets"
               } ,
    # 'MacrosoftExcel': "",
    # 'MacrosoftOneNote': "",
    # 'MacrosoftPowerPoint': {},
    # 'MacrosoftWord': {},
    'code_development': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
        "icon_name": "code",
    },
    'leisure_and_entertainment': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-pink",
        "icon_name": "music_video",
    },
    'study_tutoring': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-grey",
        "icon_name": "library_books",
    },
    'teacher_education': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-grey",
        "icon_name": "people_outline",
    },
    'copywriting_generation': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-purple",
        "icon_name": "wrap_text",
    },
    'gift_selection': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-indigo",
        "icon_name": "card_giftcard",
    },
    'research_assistance': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
        "icon_name": "computer",
    },
    'language_learning': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-green",
        "icon_name": "language",
    }
}

config.class_tree = {
    'popular':{},
    'research_assistance': {},
    'copywriting_generation': {},
    'code_development': {},
    'language_learning': {},
    'office': {
        'MicrosoftExcel': {},
        'MicrosoftOneNote': {},
        'MicrosoftPowerPoint': {},
        'MicrosoftWord': {}
    },
    'leisure_and_entertainment': {},
    'study_tutoring': {},
    'teacher_education': {},
    'gift_selection': {},
}



import os
def get_workspace():
    """
    get the workspace path
    :return:
    """
    cur_path = os.path.abspath(__file__)
    file = os.path.dirname(cur_path)
    file = os.path.dirname(file)
    file = os.path.dirname(file)
    return file
config.ws = get_workspace()


# function_lst = [
#     "Answering questions and trivia",
#     "Creative writing ideas",
#     "Resume/cover letter assistance",
#     "Productivity/self-improvement tips",
#     "Microsoft Outlook",
#     "Microsoft Access",
#     "Microsoft OneNote",
#     "Microsoft Publisher",
#     "Microsoft Teams",
#     "Microsoft Visio",
#     "Microsoft Project"
# ]



# prompt = f'Suppose you want use ChatGPT for Productivity/self-improvement tips, please directly write a short prompt enclosed in double quotes that will feed to ChatGPT. Do not show any other content that is not in the prompt.'

# prompt = "Suppose you want use ChatGPT for Productivity/self-improvement tips, ' \
#          'please write a enghlish prompt and provide an example chat for me. ' \
#          'The chat should be organized as following dict format, where priority equals the prompt is simple, otherwise 1. ' \
#          'The content is a list that records the chat. ' \
#          'The first elements of the list should be the prompt. " \
#          "{ \"priority\": 1, \"content\": [ \"I want you to act as an English translator, spelling corrector, and improver. " \
#          "I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in English. " \
#          "I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper-level English words and sentences. Keep the meaning the same, but make them more literary. " \
#          "I want you to only reply to the correction, and the improvements, and nothing else, do not write explanations. My first sentence is “je voudrais un verre de vin” \", \"I would like a glass of wine.\", \"你今天吃饭了么？\", \"Have you had your meal today?\" ] }"


# prompt = "Suppose you want use ChatGPT for Productivity/self-improvement tips,  please write a enghlish prompt and provide an example chat for me. The chat should be organized as following dict format, where priority equals the prompt is simple, otherwise 1.  The content is a list that records the chat.and the first elements of the list should be the prompt. Here is the example output: { \"priority\": 0, \"content\": [ \"将以下句子翻译成英语：“我明年想去巴黎旅游。”\", \"I want to travel to Paris next year.\"] },"
# 'Suppose you want use ChatGPT to do the task of {random.choice(function_lst)}, please directly write a short prompt enclosed in double quotes that will feed to ChatGPT. Do not show any other content that is not in the prompt.'

#  Finally, organize the output as a python dict, as {"enghlish_chat": xx, "chinese_chat": xx, "japanese_chat": xx, "korean_chat": xx, "german_chat": xx, "french_chat": xx,}, where xx in the above dict the the corresponding language chat dict.


# prompt for gpt 3.5
# Suppose you want use ChatGPT for Tech troubleshooting,  please write a prompt and provide an example chat for me. The chat should be organized as following dict format, where priority equals the prompt is simple, otherwise 1.  The content is a list that records the chat.and the first elements of the list should be the prompt. Here is the example output: { \"priority\": 0, \"content\": [ \"what time is it?\", \"It's 12:19.\"] }, Then, transalte the output into Chinese. Finally, organize the output as a python dict (named as dict_1), as {\"enghlish_chat\": xx, \"chinese_chat\": xx}, where xx in the above dict the the corresponding language chat dict. At last, repeat the above process for 3 times by changing the prompt for  Tech troubleshooting, so that you can get dict_1, dict_2, dict_3.  The final output should be like: dict_1 = {"english_chat": {
#         "priority": 1,
#         "content": [
#             "What are the key milestones in the development of quantum computing?",
#             "xx"
#         ]
#     },
#     "chinese_chat": {
#         "priority": 1,
#         "content": [
#             "xx",
#             "xx"
#         ]
#     },}
# Note, only output the final python dict, i.e., dict_1, dict_2, dict_3.