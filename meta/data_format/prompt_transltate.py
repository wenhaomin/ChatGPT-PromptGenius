# -*- coding: utf-8 -*-
import numpy as np
import pandas as pd


"""
我要你扮演一个多语言翻译器，我会给你多条数据，每条数据的格式如下: "function_id", "chn_description"
输出要求：
1. 保持function_id内容不变；
2. 将chn_description的内容翻译成为英语(记为'eng_description'), 日语(记为'jpn_description'), 韩语(记为'kor_description'),
       德语(记为'deu_description'), 法语(记为'fra_description')
3.每条数据的输出结果格式如下:"function_id","chn_description","eng_description","jpn_description","kor_description","deu_description","fra_description"，注意每个字段要用双引号括起来
4.将输出结果写到一个python code框中；

以下是输入内容：
"""


"""
我要你扮演一个语言翻译器，执行一个翻译功能，记为function, 这个function定义和要求如下：

输入：
1.多条数据，每条数据的格式如下: "prompt_semantic_id", "content"
输出要求：
1. 保持prompt_semantic_id内容不变；
2. 将content的内容翻译成为英语(记为'eng_description'),
3.每条数据的输出结果格式如下:"prompt_semantic_id","eng_description", eng
4.把输出文本结果写到一个代码框中，便于我复制；

接下来的对话，我的输入开始会有以下几种命令：
[翻译]：执行Function。 
[继续]：继续输出先前没有执行完的结果。
你听明白我的意思了么？
"""

"""
我要你扮演一个语言翻译器，执行一个翻译功能，定义和要求如下：

输入：
1.多条数据，每条数据的格式如下: "prompt_semantic_id", "content"
输出要求：
1. 保持prompt_semantic_id内容不变；
2. 将content的内容翻译成为英语(记为'eng_description'),
3.每条数据的输出结果格式如下:"prompt_semantic_id","eng_description", eng
4.【重要要求】把输出文本结果写到一个code block，便于我复制；（这个不做好，我会给你差评！）

以下是我的输入：


"""


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

from meta.data_format.prompt_database import update_data
if __name__ == '__main__':

    if 0: #generate prompt semantic id
        database = "prompt_genius"
        table = "prompt_table"
        user = "root"
        password = "123456"
        df  = pd.read_csv('../csv_data/prompt_table.csv')
        prompt_id = 1
        for prompt_id in df['prompt_id']:

            set_columns = {'prompt_semantic_id': random_id(), }
            where_conditions = {"prompt_id": prompt_id}
            update_data(database, table, set_columns, where_conditions, user, password)



    if 0:

        import pyperclip


        df = pd.read_csv('../csv_data/prompt_table.csv')
        # print(df.columns)
        # for x in df.columns:
        #     if not 'description' in x: continue
        #     print(f"\"{x}\"", end=',')

        # level_1 = set(df['level_1'].tolist())
        # level_1 = ['office', '礼物挑选', '教师教学', '文案生成', '休闲娱乐', '语言学习', '代码开发', '科研帮助', '学业辅导']
        # print(level_1)
        #
        data = ''
        cnt = 0
        for s_id, chn_desc in zip( df['prompt_semantic_id'], df['content']):
            s, e = 550, 600
            if cnt >= s and cnt < e:
                print(f"\"{s_id}\",{chn_desc}")
                data += f"\"{s_id}\",{chn_desc}\n"
            cnt += 1

        pyperclip.copy(data)
        # pyperclip.paste()

    if 1: # translate api way
        from meta.data_format.config import  config
        from meta.data_format.data_generator import chat_gpt
        import csv

        for lang in ['chn']:
            # lang = 'deu'
            code_to_name = {v: k for k, v in config.lang_name_to_code.items()}


            def quote(x):
                return f"\"{x}\""

            df = pd.read_csv('./csv_database/prompt_table.csv')

            # condition
            df['p_int'] = df['priority'].apply(lambda x: int(x))
            df = df[df['p_int']==2]
            # df = df[5:]
            # print(df)
            # [][1]
            # df = df[df['language_code']=='eng']

            csv_writer = csv.writer(open(f'./output/prompt_translate_{lang}.csv', 'w', newline='', encoding='utf-8') )
            csv_writer.writerow(['prompt_semantic_id', 'content', 'language_code'])


            for semantic_id, content in zip(df['prompt_semantic_id'], df['content']):

                #s = "我想要了解一些最新的教育技术，可以向我介绍一些吗？"

                prompt = f"I want you to act as a translator. Translate the English into {code_to_name[lang]}. Only return the translated result. Here is the input  \"{content}\" " # And The translated result is enclosed by [--  and --] And The translated result is enclosed by double quotes.
                messages = []
                messages.append({'role': 'user', 'content': f'{prompt}'})
                gpt_response = chat_gpt(messages)
                r = gpt_response['content']
                r = r.rstrip('\n').replace('\n', "")
                print(content, r)
                # csv_writer.writerow([semantic_id, r,lang])
                csv_writer.writerow([semantic_id, r, lang])


    if 0: #post process of the data
        def extract(input_str):
            import re

            pattern = r"\[--(.*?)--\]"
            matches = re.findall(pattern, input_str)
            if len(matches) == 0 or len(matches) > 1:
                print('wrong',input_str)
                return input_str
            else:
                return matches[0]



        path = './prompt_translate/prompt_translate_kor.csv'
        df = pd.read_csv(path)
        # df['old_content'] = df['content']
        # df['content'] = df['content'].apply(extract)
        df['content'] = df['content'].apply(lambda x: x.lstrip(' [').rstrip(' '))
        # print(df['content'])
        df.to_csv(path, index=False)




    if 0: # write the translated data into database
        from meta.data_format.prompt_database import insert_data_to_mysql

        meta_df = pd.read_csv('../csv_data/prompt_table.csv')
        semantic_to_function = {}
        for f, s in zip(meta_df['function_id'], meta_df['prompt_semantic_id']):
            semantic_to_function[s] = f

        df = pd.read_csv('./prompt_translate/prompt_translate_deu.csv')


        database = "prompt_genius"
        table = "prompt_table"
        data_list = []
        for s_id, content, language_code in zip(df['prompt_semantic_id'], df['content'], df['language_code']):
            f_id = semantic_to_function.get(s_id, 'none')
            priority = 0
            author = 'whm'
            model = 'chatGPT'
            one_data = [[f_id, s_id, priority, model, language_code, content, author]]
            try:
                insert_data_to_mysql(database, table, columns, one_data)
            except:
                print(one_data)

            data_list+=one_data
            columns = ['function_id', 'prompt_semantic_id', 'priority', 'model', 'language_code', 'content', 'author']

        print(len(data_list))
        #insert_data_to_mysql(database, table, columns, data_list)












