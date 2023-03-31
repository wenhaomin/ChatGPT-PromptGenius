import pandas as pd

if  0:
    df = pd.read_csv('./prompts.csv')
    df['id'] = [i for i in range(df.__len__())]
    df = df[['id', 'act', 'prompt']]
    # df.to_csv('./new_prompts.csv', index = False)


if 1:
    df_1 = pd.read_csv('./new_prompts.csv')
    df_2 = pd.read_csv('./output.csv')[['id','function']]
    df_2 = df_2[df_2['function']!='other']
    df_3= df_2.merge(df_1, on= 'id', how='left')
    print(df_3.columns)
    df_3.to_csv('./output_2.csv', index=False)
