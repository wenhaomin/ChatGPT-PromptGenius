# -*- coding: utf-8 -*-
import numpy as np
import pandas as pd
import json, random
import openai, os
import copy
import re
import json
from meta.data_format.config import config
# openai.api_key = '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' # whm

openai.api_key = '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' # ly

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




def load_json_file(file_paths):
    with open(os.path.join(*file_paths), mode='r', encoding='utf-8') as fp:
        content = json.load(fp)
    return content


def add_prompts_to_json(lst, fin):
        # lst is a list of prompt json
        # file is the path file that stores the files
        prompts = load_json_file([fin, 'prompts.json'])
        prompts = {f['function']:f for f in prompts}

        for p in lst:
            function_id = p['function_id']
            priority = p['priority']
            model = p['model']
            language_code = p['language_code']
            content = p['content']
            chat = p.get('chat', '')
            author = p.get('author', '')
            author_link = p.get('author_link', '')
            prompt_semantic_id = p.get('prompt_semantic_id', '')


            if function_id not in prompts.keys(): 
                print(f"[warnings]:{function_id} is not in current function list.")
                continue

            prompts[function_id]['content'][language_code].append(p)

        output = [v for _, v in prompts.items()]
        json.dump(output, open(dir_check(fin + '/prompts_new.json'), 'w'), indent=4)

    
import csv
def read_csv(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        rows = []
        for row in reader:
            rows.append(row)
        return rows



def add_prompts_to_database(lst):
    # add data to the prompt database
    from meta.data_format.prompt_database import insert_data_to_mysql
    from pymysql.converters import escape_string

    database, table = 'prompt_genius', 'prompt_table'
    columns = [ 'function_id', 'priority', 'model', 'language_code', 'content', 'chat', 'author', 'author_link', 'prompt_semantic_id']# 'model', 'language_code', 'content', 'chat', 'author', 'author_link', 'prompt_semantic_id']
    must_lst = ['function_id', 'priority', 'language_code', 'content', 'prompt_semantic_id']
    data_lst = []
    for p in lst:
        assert set(must_lst).issubset(set(p.keys())), f'[Error] require { set(must_lst)- set(p.keys())}'
        tmp = [escape_string(p.get(k, "")) for k in columns]
        data_lst.append(tmp)
    # print(data_lst[0])
    insert_data_to_mysql(database, table, columns, data_lst)


def random_id():
    import random
    import time
    # Generate a random string of length 10
    s = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=10))

    # Get the current date in the format YYYYMMDD
    t = time.strftime('%Y%m%d')

    # Concatenate the string and date
    result = t + '_' + s
    return result



if __name__ == "__main__":

    if 0:

    # add_prompts_to_database(lst):
        fin = './static/good_prompt/github_awesome_chatgpt_prompt/output_2.csv'
        prompt_lst = []
        for p in read_csv(fin):
            p['priority'] = "2"
            p['model'] = "ChatGPT"
            p['language_code'] = "eng"
            p['content'] = p['content']
            p['author'] = "@github"
            p['author_link'] = "https://github.com/f/awesome-chatgpt-prompts#act-as-an-educational-content-creator"
            p['prompt_semantic_id'] = random_id()
            prompt_lst.append(p)

        # incorpate new data to prompts.json
        #cur_prompt_fin = './output/'
        #add_prompts_to_json(prompt_lst, cur_prompt_fin)
        # prompt_lst = prompt_lst[:2]
        add_prompts_to_database(prompt_lst[:1])


    '''
    prompt_content_unique_trigger
    BEGIN
        DECLARE error_msg VARCHAR(255);
        
        IF EXISTS(SELECT * FROM prompt_table WHERE content = NEW.content) THEN
            SET error_msg = CONCAT('Error: The content "', NEW.content, '" already exists in the prompt_table.');
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = error_msg;
        END IF;
    END
    '''

    # generate class tree
    if 0:
        def get_class_name(class_id):
            return config.class_name.get(class_id, {lang: class_id for lang in config.supported_languages})

        def dict_to_list(d):
            result = []
            for key, value in d.items():
                tmp = {"id": key, "names": get_class_name(key)}
                #  add the icon
                icon = config.class_icon.get(key, None)
                if icon is not None:
                    tmp['icon_name'] = icon['icon_name']
                    tmp['icon_style'] = icon['icon_style']
                # for children
                if value:
                    tmp["children"] = dict_to_list(value)
                result.append(tmp)

            return result
        output = dict_to_list(config.class_tree)

        json.dump(output, open(dir_check('./output/class_tree.json'), 'w'), indent=4)


    # generate functions.json
    if 0:
        df = pd.read_csv('./csv_database/function_table.csv')
        function_lst = []
        for idx, r in df.iterrows():
            tmp = {'function_id': r['function_id']}

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
    if 1:
        # f_df = pd.read_csv('./csv_database/function_table.csv')
        df =  pd.read_csv('./csv_database/prompt_table.csv')

        # fid_to_fname = {}
        # for idx, row in f_df.iterrows():
        #     fid_to_fname[row['function_id']] = row['function_id']

        prompts_lst = []

        for fid, group_df in df.groupby(['function_id']):
            # tmp = {'function_id': fid_to_fname[fid]}
            tmp = {'function_id': fid}
            tmp['content'] = {}


            for lang in config.supported_languages:
                tmp['content'][lang] = []

                prompts_df = group_df[group_df['language_code']==lang]

                if prompts_df.__len__() <= 0: continue

                # iter each prompt
                for idx, p in prompts_df.iterrows():
                # for p in  df.to_dict(orient="records"):
                #     print(p.to_dict())
                    a_prompt_dict = {
                        'function_id': p['function_id'],
                        'priority' : p['priority'],
                        'model' : p['model'],
                        'language_code' : p['language_code'],
                        'content' : p['content'],
                        'chat' : p.get('chat', "none"),
                        'author' : p.get('author', 'none'),
                        'author_link' : p.get('author_link', "none"),
                        'prompt_semantic_id' : p.get('prompt_semantic_id', "none"),
                    }
                    tmp['content'][lang].append(a_prompt_dict)

            prompts_lst.append(tmp)

        # out_path = './output/prompts.json'
        out_path = config.ws + '/data/prompts.json'
        json.dump(prompts_lst, open(out_path, 'w'), indent=4)

                  




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



