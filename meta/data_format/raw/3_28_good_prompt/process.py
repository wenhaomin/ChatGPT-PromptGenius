import pandas as pd

if  0:
    df = pd.read_csv('./prompts.csv')
    df['id'] = [i for i in range(df.__len__())]
    df = df[['id', 'act', 'prompt']]
    # df.to_csv('./new_prompts.csv', index = False)


if 0:
    df_1 = pd.read_csv('./new_prompts.csv')
    df_2 = pd.read_csv('./output.csv')[['id','function']]
    df_2 = df_2[df_2['function']!='other']
    df_3= df_2.merge(df_1, on= 'id', how='left')
    print(df_3.columns)
    df_3.to_csv('./output_2.csv', index=False)


if 1:
    from meta.data_format.config import config
    fin1 = config.ws + '/meta/data_format/raw/3_28_good_prompt/prompt_translate_chn.csv'
    fin2 = config.ws + '/meta/data_format/csv_database/prompt_table.csv'


    df_chn = pd.read_csv(fin1)
    df = pd.read_csv(fin2)
    cols = list(df.columns)
    cols = [c for c in cols if c not in ['content','language_code']]
    df = df[cols]

    df_chn = df_chn.merge(df, on='prompt_semantic_id', how='left')
    print(df_chn)
    df_chn.to_csv('./prompt_chn.csv', index=False)


