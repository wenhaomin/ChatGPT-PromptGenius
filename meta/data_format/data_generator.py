# -*- coding: utf-8 -*-
import numpy as np
import pandas as pd
import json, random
import openai, os
import copy
import re
import json

# openai.api_key = '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' # whm

openai.api_key = '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' # ly

# function_lst = [
#     "Answering questions and trivia",
#     "Language translation/interpretation",
#     "Creative writing ideas",
#     "Resume/cover letter assistance",
#     "Productivity/self-improvement tips",
#     "Meal planning/recipes",
#     "Tech troubleshooting",
#     "Microsoft Outlook",
#     "Microsoft Access",
#     "Microsoft OneNote",
#     "Microsoft Publisher",
#     "Microsoft Teams",
#     "Microsoft Visio",
#     "Microsoft Project"
# ]

from easydict import EasyDict as edict

config = edict()
config.supported_languages = ['chn', 'eng', 'jpn', 'kor', 'deu']#'chn', 'eng', 'jpn', 'kor', 'deu'


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


def chat_gpt(messages):
    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=2500,
        temperature=0.7,
        frequency_penalty=0,
        presence_penalty=0,
        # user=username
    )
    chatgpt_response = completion.choices[0]['message']
    return chatgpt_response



def get_time_str():
    import datetime

    # Get the current date and time
    now = datetime.datetime.now()

    # Format the date and time as yyyymmddmm
    formatted_time = now.strftime("%Y%m%d%H%M%S")

    # Return the formatted time as a string
    formatted_time_str = str(formatted_time)
    return formatted_time_str


def remove_unsupported_chars(string):

    """
    Removes unsupported characters for file name in a given string
    """
    # Define a regular expression pattern to match unsupported characters
    pattern = r'[\\/*?:<>|"]'

    # Use the sub() method of the re module to replace any matches with an empty string
    cleaned_string = re.sub(pattern, '', string)

    return cleaned_string




def batch_file_name(file_dir, suffix='.train'):
    L = []
    for root, dirs, files in os.walk(file_dir):
        for file in files:
            if os.path.splitext(file)[1] == suffix:
                L.append(os.path.join(root, file))
    return L




def dir_check(path):
    """
    check weather the given path exists, if not, then create it
    """
    import os
    dir = path if os.path.isdir(path) else os.path.split(path)[0]
    if not os.path.exists(dir): os.makedirs(dir)
    return path
  


def get_function_id(string):
    return re.sub(r'[^a-zA-Z]', '-', string)



lang_name_to_code = {
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



def aggreate_prompts(file, is_test):
    # aggreate the all the prompts in the file  into one
    L = batch_file_name(file, '.json')
    prompts_dict = {}


    for l in L:
        prompt = json.load(open(l, 'r', encoding='UTF-8'))
        fuc = prompt['function'] # prompt function
        fuc = get_function_id(fuc)

        if fuc not in prompts_dict.keys():
            prompts_dict[fuc] = {'function': fuc, 'content':{}}
        for key in ['english_chat', 'chinese_chat', "japanese_chat", "korean_chat",
                    "german_chat", "french_chat"]:

            lang =  key.split("_")[0].capitalize() #  prompt language
            lang = lang_name_to_code[lang]
            if lang not in prompts_dict[fuc]['content'].keys():
                # prompts_dict[fuc]['content'][lang] = {"language": lang, "dialogs":[]}
                prompts_dict[fuc]['content'][lang] = {}

            dialog = prompt.get(key, "")
            if dialog == '': continue
            # prompts_dict[fuc]['content'][lang]['dialogs'].append(dialog)

            prompts_dict[fuc]['content'][lang] = dialog



    # function_lst = prompts_dict.keys()
    prompts_lst = copy.deepcopy(prompts_dict)

    # for fuc in function_lst:
    #     prompts_lst[fuc]['content'] =  list(prompts_lst[fuc]['content'].values())
    prompts_lst = list(prompts_lst.values())

    # generate prompts.json
    out_path =  './prompts.json' if is_test else f'./prompts_{get_time_str()}.json'
    with open(dir_check(out_path), 'w', encoding='UTF-8') as f:
        json.dump(prompts_lst, f, indent=4)

    # generate functions.json
    # function_describe = []
    # for fuc in function_lst:
    #     tmp = {'function': fuc,
    #            'languages':{},
    #            'class':[fuc]}
    #     for lang in ['chinese', 'english']:
    #         data =  json.load(open(f'./functions_list_{lang}.json', encoding='utf-8'))
    #         tmp['languages'][lang.capitalize() ] = data[fuc]
    #     function_describe.append(tmp)
    #
    #
    # with open(f'./functions_{get_time_str()}.json', 'w', encoding='UTF-8') as f:
    #     json.dump(function_describe, f, indent=4)

    # generate functions.json
    def convert_json_format(input_json):
        output_json = []

        for item in input_json:
            new_item = {}
            new_item['function'] = get_function_id(item['function'])

            new_item['desc'] = {
                'chn': item['languages']['Chinese'],
                'eng': item['languages']['English']
            }

            new_item['class'] = new_item['function']

            output_json.append(new_item)

        return output_json

    # Load input JSON file
    with open('./backup/2023-3-18/functions_20230318204804.json', 'r') as input_file:
        input_json = json.load(input_file)

    # Convert JSON format
    output_json = convert_json_format(input_json)

    # Save output JSON file
    with open('./functions.json', 'w', encoding='utf-8') as output_file:
        json.dump(output_json, output_file, indent=4)

    # generate classs.json

    # [  "Drafting-editing-written-communications",    "Tutoring-homework-help",    "Resume-cover-letter-assistance",    "Financial-planning-budgeting",    "Entertainment-recommendations",    "Travel-planning-assistance",    "Answering-questions-and-trivia",    "Language-translation-interpretation",    "Creative-writing-ideas",    "Gift-recommendations",    "Language-learning",    "Meal-planning-recipes",    "Meditation-mindfulness-guidance",    "Research-assistance",    "Tech-troubleshooting"]

    # [
    #     {
    #         "id": x,
    #         "names": {
    #             "chn": Chinese of x,
    #             "eng": English of x
    #         }
    #     }
    # ]


class_name = {
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


    'MacrosoftExcel': {
        'chn': 'Excel',
        'eng': 'Excel',
        'jpn': 'Excel',
        'fra': 'Excel',
        'kor': 'Excel',
        'deu': 'Excel',
    },

    'MacrosoftOneNote': {
        'chn': 'OneNote',
        'eng': 'OneNote',
        'jpn': 'OneNote',
        'fra': 'OneNote',
        'kor': 'OneNote',
        'deu': 'OneNote',
    },

    'MacrosoftPowerPoint': {
        'chn': 'PowerPoint',
        'eng': 'PowerPoint',
        'jpn': 'PowerPoint',
        'fra': 'PowerPoint',
        'kor': 'PowerPoint',
        'deu': 'PowerPoint',
    },

    'MacrosoftWord': {
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



class_icon = {
    "popular":{
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
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
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
        "icon_name": "music_video",
    },
    'study_tutoring': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
        "icon_name": "library_books",
    },
    'teacher_education': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
        "icon_name": "people_outline",
    },
    'copywriting_generation': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
        "icon_name": "wrap_text",
    },
    'gift_selection': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
        "icon_name": "card_giftcard",
    },
    'research_assistance': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
        "icon_name": "computer",
    },
    'language_learning': {
        "icon_style": "mdui-list-item-icon mdui-icon material-icons mdui-text-color-blue",
        "icon_name": "language",
    }
}


class_tree = {
    'popular':{},
    'office': {
        'MacrosoftExcel': {},
        'MacrosoftOneNote': {},
        'MacrosoftPowerPoint': {},
        'MacrosoftWord': {}
    },
    'code_development': {},
    'leisure_and_entertainment': {},
    'study_tutoring': {},
    'teacher_education': {},
    'copywriting_generation': {},
    'gift_selection': {},
    'research_assistance': {},
    'language_learning': {}
}



if __name__ == "__main__":



    # generate class tree
    if 1:
        def get_class_name(class_id):
            return class_name.get(class_id, {lang: class_id for lang in config.supported_languages})

        def dict_to_list(d):
            result = []
            for key, value in d.items():
                tmp = {"id": key, "names": get_class_name(key)}
                #  add the icon
                icon = class_icon.get(key, None)
                if icon is not None:
                    tmp['icon_name'] = icon['icon_name']
                    tmp['icon_style'] = icon['icon_style']
                # for children
                if value:
                    tmp["children"] = dict_to_list(value)
                result.append(tmp)

            return result
        output = dict_to_list(class_tree)

        json.dump(output, open(dir_check('./output/class_tree.json'), 'w'), indent=4)


    # generate functions.json
    if 0:
        df = pd.read_csv('./output/function_table.csv')
        function_lst = []
        for idx, r in df.iterrows():
            tmp = {'function': r['function_name']}

            tmp['desc'] = {}
            for lang in config.supported_languages:
                lang_desc = r[f"{lang}_description"]
                tmp['desc'][lang] = lang_desc

            tmp['class'] = r['classes'].split("-")
            function_lst.append(tmp)
            print(tmp)

        out_path = './output/functions.json'
        json.dump(function_lst, open(out_path,'w'), indent=4)

 
    # generate prompts.json
    if 0:
        f_df = pd.read_csv('./output/function_table.csv')
        df =  pd.read_csv('./output/prompt_table.csv')

        fid_to_fname = {}
        for idx, row in f_df.iterrows():
            fid_to_fname[row['function_id']] = row['function_name']

        prompts_lst = []

        for fid, group_df in df.groupby(['function_id']):
            tmp = {'function': fid_to_fname[fid]}
            tmp['content'] = {}


            for lang in config.supported_languages:
                tmp['content'][lang] = []

                prompts_df = group_df[group_df['language_code']==lang]

                if prompts_df.__len__() <= 0: continue

                # iter each prompt
                for idx, row in prompts_df.iterrows():
                    a_prompt_dict = {
                        'priority': 0,
                        'content':[row['content']] # todo: change as chat
                    }
                    tmp['content'][lang].append(a_prompt_dict)

            prompts_lst.append(tmp)

        out_path = './output/prompts.json'
        json.dump(prompts_lst, open(out_path, 'w'), indent=4)

                  


    if 0: # aggrate the prompts
        is_test = True
        aggreate_prompts('./promptbase/', is_test)
        #data = json.load(open('./classes_new.json'))
        # print(data)
        #json.dump(data, open('./classes_new.json', mode="w", encoding="utf-8"), indent=4)

        # prompts_dict = json.load(open('./prompts_20230318183149.json', 'r', encoding='UTF-8'))
        # print(prompts_dict)

    if 0: # generate the prompt and answer as well:
        prompt_num_per_func = 3
        # generate prompts
        for function in function_lst:
            if 'Microsoft' not in function: continue
            for i in range(prompt_num_per_func):
                prompt_dict = {}
                prompt_dict['english_chat'] = ''
                prompt_dict['chinese_chat'] = ''
                prompt_dict['japanese_chat'] = ''
                prompt_dict['korean_chat'] = ''
                prompt_dict['german_chat'] = ''
                prompt_dict['french_chat'] = ''
                prompt_dict['function'] = function
                prompt_dict['tag'] = ''

                # prompt = f"Suppose you want use ChatGPT for {function},  please write a prompt and provide an example chat for me. "
                # prompt += "The chat should be organized as following dict format, where priority equals the prompt is simple, otherwise 1.  The content is a list that records the chat. And the first elements of the list should be the prompt. Here is the example output: { \"priority\": 0, \"content\": [ \"what time is it?\", \"It's 12:19.\"] },"
                # prompt += " Finally, organize the output as a python dict (named as dict_1), as {\"enghlish_chat\": xx}, where xx in the above dict the is the chat dict."
                # prompt += "Note, only output the final python dict, i.e., dict_1."

                prompt = f"Suppose you want use ChatGPT for {function}, please think a demand first then write a prompt to achieve the demand. "
                # prompt += "The chat should be organized as following dict format, where priority equals the prompt is simple, otherwise 1.  The content is a list that records the chat. And the first elements of the list should be the prompt. Here is the example output: { \"priority\": 0, \"content\": [ \"what time is it?\", \"It's 12:19.\"] },"
                # prompt += " Finally, organize the output as a python dict (named as dict_1), as {\"enghlish_chat\": xx}, where xx in the above dict the is the chat dict."
                # prompt += "Note, only output the final python dict, i.e., dict_1."
                # print(prompt)
                prompt_dict['content'] = prompt

                messages = []
                messages.append({'role': 'user', 'content': f'{prompt}'})
                gpt_response = chat_gpt(messages)
                prompt_dict['raw_output'] = gpt_response["content"]
                print(gpt_response['content'])

                with open(f'./tmp/{remove_unsupported_chars(function)}_{get_time_str()}_{random.randint(0, 100)}.json', 'w') as f:
                    json.dump(prompt_dict, f, indent=4)

    if 0: # generate the prompt
        prompt_num_per_func = 3
        # generate prompts
        for function in function_lst:
            for i in range(prompt_num_per_func):
                prompt_dict = {}
                prompt_dict['english_chat'] = ''
                prompt_dict['chinese_chat'] = ''
                prompt_dict['japanese_chat'] = ''
                prompt_dict['korean_chat'] = ''
                prompt_dict['german_chat'] = ''
                prompt_dict['french_chat'] = ''



                prompt_dict['function'] = function
                prompt_dict['tag'] = ''


                prompt =  f"Suppose you want use ChatGPT for {function},  please write a prompt and provide an example chat for me. "
                prompt += "The chat should be organized as following dict format, where priority equals the prompt is simple, otherwise 1.  The content is a list that records the chat.and the first elements of the list should be the prompt. Here is the example output: { \"priority\": 0, \"content\": [ \"what time is it?\", \"It's 12:19.\"] },"
                prompt += ' Then, transalte the output into Chinese.'
                prompt += " Finally, organize the output as a python dict (named as dict_1), as {\"enghlish_chat\": xx, \"chinese_chat\": xx}, where xx in the above dict the the corresponding language chat dict."
                prompt += f"At last, repeat the above process for {prompt_num_per_func} times by changing the prompt for  {function}, so that you can get dict_1, dict_2, dict_3. "
                prompt += "Note, only output the final python dict, i.e., dict_1, dict_2, dict_3."
                # print(prompt)
                prompt_dict['content'] = prompt


                with open(f'./one/{remove_unsupported_chars(function)}_{get_time_str()}_{random.randint(0,100)}.json', 'w') as f:
                    json.dump(prompt_dict, f, indent=4)



    if 0: # set the prompt
        print("Welcome to GPT-3.5-turbo! Start typing your questions or type 'quit' to exit.")
        prompt = ""
        messages = []

        user_input = prompt
        messages.append({'role': 'user', 'content': f'{user_input}'})
        gpt_response = chat_gpt(messages)
        messages.append(gpt_response)  # {'role': 'assistant', 'content': f'{gpt_response["content"]}'}
        print("GPT-3.5-turbo:", gpt_response["content"])


    if 0: # chat
        messages = []
        while True:
            user_input = input("You: ")
            messages.append({'role':'user', 'content': f'{user_input}'})
            if user_input.lower() == "quit":
                print("Goodbye!")
                break

            gpt_response = chat_gpt(messages)
            messages.append(gpt_response) # {'role': 'assistant', 'content': f'{gpt_response["content"]}'}
            print("GPT-3.5-turbo:",  gpt_response["content"])


