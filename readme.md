
<h1 align="center">
💡Prompt Genius
</h1>
<p align="center">
    <a href="./readme-en.md">English</a> | 中文
</p>
<p align="center">
    <em>全面、有效的 ChatGPT指令大全</em>
</p>

## Why use Prompt Genius?

- 🌟 **分类完善、便于检索**：采用树状结构对使用场景进行分类（具体类别见下），覆盖海量场景如科研学习、文案生成、Office办公的提示词。
- 🚀 **热门提示词**：持续收集和展示热门提示词，帮助获得用户期望的、高质量回复，从而提升生产力。
- 🌎 **多语言支持**：目前支持中文、英文、日语、韩语和德语等多种语言。
- 🛠 **便捷操作**：支持提示词复制功能
- 🆕 **定期更新**：提示词来自网络精选和 Awesome ChatGPT Prompts和用户投稿，定期进行更新。
- 📦 **开箱即用**：[www.promptgenius.site](https://www.promptgenius.site)


## 使用说明

Prompt Genius 页面默认显示热门分类提示词，页面分为分类检索区、搜索区和提示词展示区。

![image](./img/prompt_genius.png)

### 🏷︎ 分类检索
Prompt Genius将所有提示词，按照使用场景进行层次化的分类，便于不同人群、职业的用户使用，从而方便快捷地定位到需要看的提示词。
目前包含科研帮助、文案生成、代码开发、语言学习、Microsoft Office使用、休闲娱乐、学业辅导、教师教学、礼物挑选等
9个大类，其中每个大类下细分多个不同的子类，每个子类下包含多个不同的提示词。 目前整体分类体系如下：


![image](./img/class_tree.png)


### 🔍 关键词搜索

关键词搜索范围包括提示词类别标签和内容。输入关键词后，按回车键，提示词展示区将展示查找出的内容。


### 🔬 展示区

通过关键词搜索，点击卡片左上方的「copy」按钮即可复制提示词，将其粘贴到 ChatGPT 中。展示信息包括提示词类别标签、author信息（带有或者不带有链接。）

![image](./img/prompt_show.png)

### 🌎 语言切换

网站默认使用英文，因为ChatGPT等在英文上的训练语料更多，更加容易获得高质量的结果。如果需要使用中文或者其他语言，如日语、韩语、德语等，可以在页面右上角进行语言切换。
切换之后将显示当前类别下，新语言的提示词。


### 用户投稿
如果您正好知道一个实用的提示词但本网站并未列出，您可以在此提交。感谢您的贡献！


![image](./img/user_submit.png)


## 技术设计

前端使用 [MDUI](https://www.mdui.org/) 和 [jQuery](https://jquery.com/)实现.

后台使用 [Flask](https://flask.palletsprojects.com/) 和其他python包实现 (参见 [requirements](./requirements.txt)).


### 启动服务

```shell
# Install packages
pip install -r requirements.txt

# Start the Flask server in debug mode.
export FLASK_APP=app
export FLASK_DEBUG=true
flask run --port 9000

# Start the server with waitress for better performance in production environment.
waitress-serve --port=8080 --call app:create_app
```

### 数据模型和数据库

这个项目的大部分数据，包括一些元素内容、语言、类别树和提示，都存储在数据库中

数据模型定义基于SqlAlchemy, 参考文件 [the model file](./app/models.py).
从技术上来说，抽象的数据模型设计使得可以自由选择各种不同的数据库解决方案。


数据库配置参考文件 [the configuration file](./app/app_config.json). 我们提供了一个使用 SQLite 作为数据库的示例。SQLite完全基于文件，非常适合像这样的轻量级应用程序。如果运行时没有数据库，SqlAlchemy 将在`./instance` 文件夹下，创建一个新的数据库文件。之后可以根据需要添加自己的数据。

## 感谢以下用户的贡献！
```
@x7peeps: 我希望你能充当我的学术文献翻译角色。我会用任何语言与你交谈，你将检测语言，翻译并用纠正和改进过的英语文本回答。我希望你能用更精准、通俗易懂。请只回复翻译的译文即可，不要写解释。 
```



