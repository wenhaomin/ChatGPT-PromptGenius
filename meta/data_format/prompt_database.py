# -*- coding: utf-8 -*-
import numpy as np
import pandas as pd
import pymysql
from pymysql.converters import escape_string

config = {
    'host':'localhost',
    'user': 'root',
    'password': '123456',
    'database':'prompt_genius',
}


def create_table():
    """
    创建行为数据表
    :return:
    """
    # 打开数据库连接
    db = pymysql.connect(host=config['host'],
                         user=config['user'],
                         password=config['password'],
                         database=config['database'])

    # 使用 cursor() 方法创建一个游标对象 cursor
    cursor = db.cursor()

    # 创建 function table
    cursor.execute("DROP TABLE IF EXISTS function_table")  # behavior_record
    # 使用预处理语句创建表
    sql = """CREATE TABLE function_table (
                function_id varchar(255) not null,
                primary key (function_id),
                level_1 TINYTEXT,
                level_2 TINYTEXT,
                classes TINYTEXT,
                chn_description TINYTEXT,
                eng_description TINYTEXT,
                jpn_description TINYTEXT,
                kor_description TINYTEXT,
                deu_description TINYTEXT,
                fra_description TINYTEXT
                )"""
    cursor.execute(sql)


    # 使用 execute() 方法执行 SQL，如果表存在则删除
    cursor.execute("DROP TABLE IF EXISTS prompt_table")  # behavior_record
    # foreign key (function_id) references function_table (function_id),

    # 使用预处理语句创建表
    sql = """CREATE TABLE prompt_table (
             prompt_id int not null AUTO_INCREMENT,
             function_id TINYTEXT not null,
             primary  key (prompt_id),
             
             priority int,
             model varchar (20),
             language_code varchar (20),
             content LONGTEXT,
             chat LONGTEXT,
             author varchar (20)

             )"""
    cursor.execute(sql)

    # 关闭数据库连接
    db.close()




def insert_data_to_mysql(database, table, columns, data_list, host='localhost', user='root', password='123456'):
    """
    Inserts data from a list into a MySQL database table.

    :param database: Name of the MySQL database
    :param table: Name of the table in the database
    :param columns: A tuple or list containing column names
    :param data_list: A list of tuples, where each tuple represents a row of data
    :param host: Hostname or IP address of the MySQL server (default: 'localhost')
    :param user: MySQL user (default: 'your_username')
    :param password: MySQL password (default: 'your_password')
    """

    # Establish connection to the MySQL server
    connection = pymysql.connect(host=host,
                                 user=user,
                                 password=password,
                                 database=database,
                                 charset='utf8mb4',
                                 cursorclass=pymysql.cursors.DictCursor)

    try:
        with connection.cursor() as cursor:
            # Create SQL query to insert data into the table
            columns_str = ", ".join(columns)
            placeholders = ", ".join(["%s"] * len(columns))
            sql = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"

            # Execute SQL query and commit changes
            cursor.executemany(sql, data_list)
            connection.commit()
    except Exception as err:
            print(f"Unexpected {err=}, {type(err)=}", "Sql:", sql)
    finally:
        # Close the connection
        connection.close()


import pymysql

def update_data(database, table, set_columns, where_conditions, user, password, host='localhost', port=3306):
    # Connect to the MySQL database
    connection = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database
    )
    cursor = connection.cursor()

    # Prepare the SQL query for updating data
    # set_clause = ", ".join([f"{column} = '{value}'" for column, value in set_columns.items()])
    # where_clause = " AND ".join([f"{column} = '{value}'" for column, value in where_conditions.items()])

    set_clause = ", ".join([f"{column} = \"{value}\"" for column, value in set_columns.items()])
    where_clause = " AND ".join([f"{column} = \"{value}\"" for column, value in where_conditions.items()])
    sql_query = f"UPDATE {table} SET {set_clause} WHERE {where_clause};"

    try:
        # Execute the SQL query and commit the changes
        cursor.execute(sql_query)
        connection.commit()
        print(f"{cursor.rowcount} row(s) updated successfully")
    except pymysql.Error as error:
        print(f"Error: {error}", "current sql:", sql_query)
    finally:
        # Close the cursor and connection
        cursor.close()
        connection.close()







def df_to_function_database(df):
    cols = ['level_1', 'level_2', 'function_id']
    assert set(cols).issubset(df.columns), f"{df.columns}"

    df = df[cols]
    # 写function table
    data_list = []
    df = df.drop_duplicates()
    print(df)
    for l1, l2, f_id in zip(df['level_1'], df['level_2'], df['function_id']):
        chn = f_id
        f_id = f"{l1}_{l2}_{f_id}"
        l2 = f"{l1}_{l2}"
        data_list.append([l1, l2, f_id, chn])
    insert_data_to_mysql('function_table', ['level_1', 'level_2', 'function_id', 'chn_description'], data_list)

def df_to_prompt_database(df):
    assert set(['level_1', 'level_2', 'function_id','chn_description']).issubset(df.columns), f"{df.columns}"

    # 写prompt table
    data_list = []
    for l1, l2, f_id, chn in zip(df['level_1'], df['level_2'], df['function_id'], df['chn_description']):
        f_id = f"{l1}_{l2}_{f_id}"

        priority = 0
        model = 'chatGPT'
        author = 'whm'
        language_code = 'chn'
        content = chn
        data_list.append([f_id, priority, model, language_code, content, author])
    insert_data_to_mysql('prompt_table', ['function_id', 'priority', 'model', 'language_code', 'content', 'author'], data_list)



if __name__ == '__main__':
    #create_table()
    if 0:
        # 写function表
        df = pd.read_csv('./static/raw/office.csv')

        df = df[['level_2', 'function_id']]

        df =  df.drop_duplicates()
        df['level_1'] = 'office'
        print(df)

        print(df.values.tolist())
        data_list = []
        for l1, l2, f_id in zip(df['level_1'], df['level_2'], df['function_id']):
            chn = f_id
            l2 = 'MacrosoftPowerPoint' if l2 == 'MacrosoftPowerPoin' else l2
            f_id = f"{l1}_{l2}_{f_id}"

            l2 = f"{l1}_{l2}"

            data_list.append([l1, l2, f_id, chn])
        insert_data_to_mysql('function_table', ['level_1', 'level_2', 'function_id', 'chn_description'], data_list)

    if 0:
        # 写prompt表
        df = pd.read_csv('./static/raw/office.csv')

        df = df[['level_2', 'function_id',"chn_description"]]

        df['level_1'] = 'office'
        print(df)

        data_list = []
        for l1, l2, f_id, chn in zip(df['level_1'], df['level_2'], df['function_id'], df['chn_description']):
            l2 = 'MacrosoftPowerPoint' if l2 == 'MacrosoftPowerPoin' else l2
            f_id = f"{l1}_{l2}_{f_id}"

            l2 = f"{l1}_{l2}"

            priority = 0
            model = 'chatGPT'
            author = 'whm'
            language_code = 'chn'
            content = chn
            data_list.append([f_id, priority, model, language_code, content, author])
        insert_data_to_mysql('prompt_table', ['function_id', 'priority', 'model', 'language_code', 'content', 'author'], data_list)


    if 0: # research
        df = pd.read_csv('./static/raw/research.csv')
        df['level_1'] = '科研帮助'
        df['level_2'] = 'none'
        # print(df)
        df_to_function_database(df)
        df_to_prompt_database(df)

    if 0: #develop
        df = pd.read_csv('./static/raw/develop.csv')
        df['level_1'] = '代码开发'
        df['level_2'] = 'none'
        df_to_function_database(df)
        df_to_prompt_database(df)

        pass


    if 0: # entertainment
        df = pd.read_csv('./static/raw/entertainment.csv')
        df['level_1'] = '休闲娱乐'
        df['level_2'] =  'none'
        df_to_function_database(df)
        df_to_prompt_database(df)

    if 0: #gift
        df = pd.read_csv('./static/raw/gift.csv')
        df['level_1'] = '礼物挑选'
        df['level_2'] = 'none'
        df_to_function_database(df)
        df_to_prompt_database(df)

    if 0: #writing
        df = pd.read_csv('./static/raw/writing.csv')
        df['level_1'] = '文案生成'
        df['level_2'] = 'none'
        df_to_function_database(df)
        df_to_prompt_database(df)

    if 0:  # writing
        df = pd.read_csv('./static/raw/language_learning.csv')
        df['level_1'] = '语言学习'
        df['level_2'] = 'none'
        df_to_function_database(df)
        df_to_prompt_database(df)

    if 0:  # writing
        df = pd.read_csv('./static/raw/teaching.csv')
        df['level_1'] = '教师教学'
        df['level_2'] = 'none'
        df_to_function_database(df)
        df_to_prompt_database(df)

    if 0:  # writing
        df = pd.read_csv('./static/raw/for_student.csv')
        df['level_1'] = '学业辅导'
        df['level_2'] = 'none'
        df_to_function_database(df)
        df_to_prompt_database(df)






    if 0: # insert table test
        # Example usage:
        database = 'test_db'
        table = 'test_table'
        # columns = ('column1', 'column2', 'column3')
        # data_list = [
        #     ('value1', 'value2', 'value3'),
        #     ('value4', 'value5', 'value6'),
        #     ('value7', 'value8', 'value9')
        # ]

        columns = ('column1', 'column2', 'column3')
        data_list = [
            ('value1', 'value2', 'value3'),
            ('value4', 'value5', 'value6'),
            ('value7', 'value8', 'value9')
        ]
        insert_data_to_mysql(database, table, columns, data_list)
    if 0: create_table()

    if 0: # update data test
        # Example usage
        database = "test_db"
        table = "test_table"
        set_columns = {"column1": "new_value1", "column2": "new_value2"}
        where_conditions = {"column1": "value1", "column2": "value2"}
        user = "root"
        password = "123456"

        update_data(database, table, set_columns, where_conditions, user, password)

