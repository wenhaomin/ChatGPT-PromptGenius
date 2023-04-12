<h1 align="center">
💡Prompt Genius
</h1>
<p align="center">
    <a href="./readme.md">中文 </a> |English
</p>
<p align="center">
    <em>All-purpose prompts with hierarchical classification system. Helps you quickly find the prompt you want</em>
</p>

## Why use Prompt Genius?

- 🌟 **Well-organized, easy to search**: Adopting a tree structure to categorize usage scenarios (see categories below), covering a wide range of scenarios such as research, copywriting, and Office productivity prompts.
- 🚀 **Popular prompts**: Continuously collecting and displaying popular prompts to help users get expected, high-quality responses, thus improving productivity.
- 🌎 **Multi-language support**: Currently supporting Chinese, English, Japanese, Korean, and German among other languages.
- 🤏 **Convenient operation**: Supports prompt copying feature
- 🆕 **Regularly updated**: Prompts are sourced from curated online selections and Awesome ChatGPT Prompts and user contribution, with regular updates.
- 📦 **Ready-to-use**: [PromptGenius website](http://8.130.82.126:8080/)

## Usage instructions

The Prompt Genius page displays popular categorized prompts by default, with the page divided into category search, search, and prompt display sections.

![image](./img/prompt_genius.png)

### 🏷︎ Category search
Prompt Genius categorizes all prompts hierarchically by usage scenario, making it easy for users with different backgrounds and occupations to quickly locate the desired prompts.
Currently includes 9 main categories: research assistance, copywriting, code development, language learning, Microsoft Office usage, leisure and entertainment, academic tutoring, teacher instruction, and gift selection, each with multiple subcategories containing various prompts. The overall classification system is as follows:

![image](./img/class_tree.png)

### 🔍 Keyword search

Keyword search scope includes prompt category labels and content. After entering a keyword, press Enter to display the search results in the prompt display area.

### 🔬 Display area

After keyword search, click the "copy" button in the upper-left corner of the card to copy the prompt and paste it into ChatGPT. Display information includes prompt category labels, author information (with or without links).

![image](./img/prompt_show.png)

### 🌎 Language switch

The website defaults to English, as ChatGPT and others have more English training data, making it easier to obtain high-quality results. If you need to use Chinese or other languages, such as Japanese, Korean, German, etc., you can switch languages in the upper right corner of the page.
After switching, the prompts for the new language will be displayed in the current category.

### User Submit
If you happens to know a useful prompt that is not listed in this page, you can submit it here. Thank you for your kind contribution!

![image](./img/user_submit.png)



## Installation

```shell
# install packages
pip install -r requirements.txt

# run
waitress-serve --port=8080 --call app:create_app
```