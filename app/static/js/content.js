/**
 * Basic multi-language contents.
 */

const special_class_contents = [
    {
        'ID': 'special-user_fav',
        'names': {
            'eng': 'My Favorites',
            'chn': '我的最爱',
            'jpn': '私のお気に入り',
            'kor': '내가 좋아하는 것들',
            'deu': 'Meine Favoriten'
        },
        'icon': 'heart-fill',
        'icon_style': 'C62828'
    },
    {
        'ID': 'special-popular',
        'names': {
            'eng': 'Popular',
            'chn': '精选',
            'jpn': '人気',
            'kor': '인기 있는',
            'deu': 'Beliebt'
        },
        'icon': 'star',
        'icon_style': 'F44336'
    },
    {
        'ID': 'special-user_submit',
        'names': {
            'eng': 'User Submit',
            'chn': '用户投稿专区',
            'jpn': 'ユーザーによる送信',
            'kor': '사용자 기여 영역',
            'deu': 'Bereich für Benutzerbeiträge'
        },
        'icon': 'people',
        'icon_style': 'ff5722'
    }
]

const navbar_contents = {
    'eng': ['Home', 'AI Tools', 'About'],
    'chn': ['主页', 'AI工具', '关于'],
    'jpn': ['ホーム', 'AI工具', 'について'],
    'kor': ['홈', 'AI도구', '소개'],
    'deu': ['Startseite', 'KI-Tools', 'Über']
}

const page_setting_contents = {
    "chn": {
        "dialog_title": "页面设置",
        "basic_element_title": "页面基本语言：",
        "basic_element_discription": "影响页面基本元素，包括导航栏、分类树、按钮、工具和关于界面。",
        "prompt_title": "提示词语言：",
        "prompt_discription": "影响显示提示词的语言范围，可多选。"
    },
    "eng": {
        "dialog_title": "Page Settings",
        "basic_element_title": "Page Basic Language:",
        "basic_element_discription": "Affects basic page elements including navigation bar, category tree, buttons, tools, and the About page.",
        "prompt_title": "Prompt Language:",
        "prompt_discription": "Affects the language range for displaying prompts, can select multiple."
    },
    "jpn": {
        "dialog_title": "ページ設定",
        "basic_element_title": "ページ基本言語：",
        "basic_element_discription": "ナビゲーションバー、カテゴリツリー、ボタン、ツール、および関連セクションなど、基本的なページ要素に影響します。",
        "prompt_title": "プロンプト言語：",
        "prompt_discription": "プロンプトの表示言語範囲に影響を与えます。複数選択可。"
    },
    "kor": {
        "dialog_title": "페이지 설정",
        "basic_element_title": "기본 언어:",
        "basic_element_discription": "내비게이션 바, 카테고리 트리, 버튼, 도구, 소개 섹션 등 기본 페이지 요소에 영향을 줍니다.",
        "prompt_title": "프롬프트 언어:",
        "prompt_discription": "프롬프트 표시 언어 범위에 영향을 줍니다. 복수 선택 가능."
    },
    "deu": {
        "dialog_title": "Seiteneinstellungen",
        "basic_element_title": "Grundlegendes Sprache:",
        "basic_element_discription": "Beeinflusst grundlegende Seitenelemente wie Navigationsleiste, Kategorienbaum, Schaltflächen, Werkzeuge und Abschnitt Über uns.",
        "prompt_title": "Hinweissprache:",
        "prompt_discription": "Beeinflusst die Sprachbereichsauswahl für die Anzeige von Hinweisen. Mehrfachauswahl möglich."
    }
}

const site_contents = {
    "eng": {
        "title": "PromptGenius",
        "class_canvas_title": "Browse classes",
        "action_canvas_title": "More",
        "ok_text": "OK",
        "popular_name": "Popular"
    },
    "chn": {
        "title": "提示精灵",
        "class_canvas_title": "浏览类别",
        "action_canvas_title": "更多",
        "ok_text": "确定",
        "popular_name": "精选"
    },
    "jpn": {
        "title": "ヒントウィザード",
        "class_canvas_title": "カテゴリ",
        "action_canvas_title": "もっと",
        "ok_text": "OK",
        "popular_name": "人気"
    },
    "kor": {
        "title": "팁마법사",
        "class_canvas_title": "수업 찾아보기",
        "action_canvas_title": "더 보기",
        "ok_text": "좋아요",
        "popular_name": "인기 있는"
    },
    "deu": {
        "title": "PromptGenie",
        "class_canvas_title": "Klassen durchsuchen",
        "action_canvas_title": "Mehr",
        "ok_text": "OK",
        "popular_name": "Beliebt"
    }
}

const submit_contents = {
    "eng": {
        "title": "Submit your prompt",
        "message": "If you happens to know a useful prompt that is not listed in this page, you can submit it here. Thank you for your kind contribution!",
        "func_placeholder": "Brief description of the function",
        "prompt_placeholder": "Prompt content",
        "username_placeholder": "Your name (optional)",
        "ok_btn_text": "Submit",
        "clear_btn_text": "Clear"
    },
    "chn": {
        "title": "提交您的提示词",
        "message": "如果您正好知道一个实用的提示词但本网站并未列出，您可以在此提交。感谢您的贡献！",
        "func_placeholder": "功能描述",
        "prompt_placeholder": "提示词",
        "username_placeholder": "您的名字（可选）",
        "ok_btn_text": "提交",
        "clear_btn_text": "清空"
    },
    "jpn": {
        "title": "プロンプトを送信する",
        "message": "このページに記載されていない便利なプロンプトを知っている場合は、ここで送信できます。 お客様の親切な貢献に感謝します！",
        "func_placeholder": "機能の簡単な説明",
        "prompt_placeholder": "プロンプトの内容",
        "username_placeholder": "お名前（任意）",
        "ok_btn_text": "送信",
        "clear_btn_text": "クリア"
    },
    "kor": {
        "title": "프롬프트 제출",
        "message": "이 페이지에 나열되지 않은 유용한 프롬프트를 알고 있는 경우 여기에서 제출할 수 있습니다. 당신의 친절한 기여에 감사드립니다!",
        "func_placeholder": "기능에 대한 간략한 설명",
        "prompt_placeholder": "신속한 콘텐츠",
        "username_placeholder": "귀하의 이름(선택사항)",
        "ok_btn_text": "제출하다",
        "clear_btn_text": "분명한"
    },
    "deu": {
        "title": "Senden Sie Ihre Aufforderung",
        "message": "Wenn Sie zufällig eine nützliche Eingabeaufforderung kennen, die nicht auf dieser Seite aufgeführt ist, können Sie sie hier einreichen. Vielen Dank für Ihren freundlichen Beitrag!",
        "func_placeholder": "Kurze Beschreibung der Funktion",
        "prompt_placeholder": "Prompter Inhalt",
        "username_placeholder": "Ihr Name (optional)",
        "ok_btn_text": "Einreichen",
        "clear_btn_text": "Klar"
    }
}

const searchbar_contents = {
    "eng": {
        "placeholder": "Search",
    },
    "chn": {
        "placeholder": "搜索",
    },
    "jpn": {
        "placeholder": "検索",
    },
    "kor": {
        "placeholder": "찾다",
    },
    "deu": {
        "placeholder": "Suchen",
    },
}

const actionbar_contents = {
    "eng": {
        "submit_btn_text": "Share Prompt"
    },
    "chn": {
        "submit_btn_text": "分享提示词"
    },
    "jpn": {
        "submit_btn_text": "共有する"
    },
    "kor": {
        "submit_btn_text": "공유하다"
    },
    "deu": {
        "submit_btn_text": "Beitragen"
    },
}

const user_contents = {
    "eng": {
        "welcome_text": "Welcome",
        "guest_name": "Guest",
        "login_text": "Login",
        "register_text": "Register",
        "logout_text": "Logout",
        "user_setting_text": "User settings",
        "login_message": "After login, you can mark prompts as your favorites, and build your personalized prompt libraries.",
        "username_ph": "Username",
        "password_ph": "Password",
        "password_re_ph": "Password (repeat)",
        "login_error_message": "Login failed, please check your username and password.",
        "register_error_message": "Register failed, please try another username.",
        "oldpass_ph": "Old password",
        "newpass_ph": "New password",
        "newpass_re_ph": "New password (repeat)",
        "setting_error_message": "Change setting failed, please check your password.",
        "fav_class_name": "My Favorites"
    },
    "chn": {
        "welcome_text": "欢迎",
        "guest_name": "游客",
        "login_text": "登录",
        "register_text": "注册",
        "logout_text": "登出",
        "user_setting_text": "用户设置",
        "login_message": "登录后，您可以将提示词添加到收藏夹中，构建您的个性化提示词库。",
        "username_ph": "用户名",
        "password_ph": "密码",
        "password_re_ph": "密码（重复）",
        "login_error_message": "登录失败，请检查您的用户名和密码。",
        "register_error_message": "注册失败，请尝试换一个用户名。",
        "oldpass_ph": "老密码",
        "newpass_ph": "新密码",
        "newpass_re_ph": "新密码（重复）",
        "setting_error_message": "设置失败，请检查您的密码。",
        "fav_class_name": "我的最爱"
    },
    "jpn": {
        "welcome_text": "ようこそ",
        "guest_name": "ゲスト",
        "login_text": "ログイン",
        "register_text": "登録",
        "logout_text": "ログアウト",
        "user_setting_text": "ユーザー設定",
        "login_message": "ログイン後、プロンプトをお気に入りに追加し、パーソナライズされたプロンプト ライブラリを構築できます。",
        "username_ph": "ユーザー名",
        "password_ph": "パスワード",
        "password_re_ph": "パスワード（繰り返し）",
        "login_error_message": "ログインに失敗しました。ユーザー名とパスワードを確認してください。",
        "register_error_message": "登録に失敗しました。別のユーザー名を試してください。",
        "oldpass_ph": "古いパスワード",
        "newpass_ph": "新しいパスワード",
        "newpass_re_ph": "新しいパスワード (繰り返し)",
        "setting_error_message": "設定の変更に失敗しました。パスワードを確認してください。",
        "fav_class_name": "私のお気に入り"
    },
    "kor": {
        "welcome_text": "환영",
        "guest_name": "손님",
        "login_text": "로그인",
        "register_text": "등록",
        "logout_text": "로그 아웃",
        "user_setting_text": "사용자 설정",
        "login_message": "로그인 후 즐겨찾기에 프롬프트를 추가하고 개인화된 프롬프트 라이브러리를 구축할 수 있습니다.",
        "username_ph": "사용자 이름",
        "password_ph": "비밀번호",
        "password_re_ph": "비밀번호(반복)",
        "login_error_message": "로그인에 실패했습니다. 사용자 이름과 비밀번호를 확인하세요.",
        "register_error_message": "등록하지 못했습니다. 다른 사용자 이름을 입력하세요.",
        "oldpass_ph": "이전 비밀번호",
        "newpass_ph": "새 비밀번호",
        "newpass_re_ph": "새 비밀번호(반복)",
        "setting_error_message": "설정 변경에 실패했습니다. 비밀번호를 확인하세요.",
        "fav_class_name": "내가 좋아하는 것들"
    },
    "deu": {
        "welcome_text": "Willkommen",
        "guest_name": "Gast",
        "login_text": "Anmelden",
        "register_text": "Registrieren",
        "logout_text": "Ausloggen",
        "user_setting_text": "Benutzereinstellungen",
        "login_message": "Nach der Anmeldung können Sie Eingabeaufforderungen zu Ihren Favoriten hinzufügen und Ihre personalisierten Eingabeaufforderungsbibliotheken erstellen.",
        "username_ph": "Nutzername",
        "password_ph": "Passwort",
        "password_re_ph": "Passwort (wiederholen)",
        "login_error_message": "Die Anmeldung ist fehlgeschlagen. Bitte überprüfen Sie Ihren Benutzernamen und Ihr Passwort.",
        "register_error_message": "Die Registrierung ist fehlgeschlagen. Bitte versuchen Sie es mit einem anderen Benutzernamen.",
        "oldpass_ph": "Altes Passwort",
        "newpass_ph": "Neues Passwort",
        "newpass_re_ph": "Neues Passwort (wiederholen)",
        "setting_error_message": "Die Einstellung konnte nicht geändert werden. Bitte überprüfen Sie Ihr Passwort.",
        "fav_class_name": "Meine Favoriten"
    }
}

const banner_contents = {
    "eng": [
        {
            "image": "static/asset/banners/pg_eng.png",
            "url": "https://www.promptgenius.site/"
        },
        {
            "image": "static/asset/banners/device_eng.png",
            "url": "https://www.promptgenius.site/"
        },
        {
            "image": "static/asset/banners/OC-banner-eng.png",
            "url": "https://overleafcopilot.github.io/"
        },
    ],
    "chn": [
        {
            "image": "static/asset/banners/pg_chn.png",
            "url": "https://www.promptgenius.site/"
        },
        {
            "image": "static/asset/banners/device_chn.png",
            "url": "https://www.promptgenius.site/"
        },
        {
            "image": "static/asset/banners/OC-banner-chn.png",
            "url": "https://overleafcopilot.github.io/"
        },
    ],
    "jpn": [
        {
            "image": "static/asset/banners/pg_jpn.png",
            "url": "https://www.promptgenius.site/"
        },
        {
            "image": "static/asset/banners/device_jpn.png",
            "url": "https://www.promptgenius.site/"
        },
        {
            "image": "static/asset/banners/OC-banner-eng.png",
            "url": "https://overleafcopilot.github.io/"
        },
    ],
    "kor": [
        {
            "image": "static/asset/banners/pg_kor.png",
            "url": "https://www.promptgenius.site/"
        },
        {
            "image": "static/asset/banners/device_kor.png",
            "url": "https://www.promptgenius.site/"
        },
        {
            "image": "static/asset/banners/OC-banner-eng.png",
            "url": "https://overleafcopilot.github.io/"
        },
    ],
    "deu": [
        {
            "image": "static/asset/banners/pg_deu.png",
            "url": "https://www.promptgenius.site/"
        },
        {
            "image": "static/asset/banners/device_deu.png",
            "url": "https://www.promptgenius.site/"
        },
        {
            "image": "static/asset/banners/OC-banner-eng.png",
            "url": "https://overleafcopilot.github.io/"
        },
    ],
}

const prompt_card_contents = {
    "eng": {
        "copy_text": "Copy",
        "fav_text": "Mark",
        "more_text": "Example"
    },
    "chn": {
        "copy_text": "复制",
        "fav_text": "收藏",
        "more_text": "示例"
    },
    "jpn": {
        "copy_text": "コピー",
        "fav_text": "マーク",
        "more_text": "例"
    },
    "kor": {
        "copy_text": "복사",
        "fav_text": "표시",
        "more_text": "예"
    },
    "deu": {
        "copy_text": "Kopieren",
        "fav_text": "Mark",
        "more_text": "Beispiel"
    },
}

const warning_contents = {
    "eng": {
        "no_prompt": 'There are currently no prompt under the filter you applied.',
        "not_implemented": 'Sorry, this is a function in developing.'
    },
    "chn": {
        "no_prompt": '当前未有符合您条件的提示词。',
        "not_implemented": '抱歉，此功能正在开发中。'
    },
    "jpn": {
        "no_prompt": '現在、適用したフィルターの下にプロンプトはありません。',
        "not_implemented": '申し訳ありませんが、これは開発中の機能です。'
    },
    "kor": {
        "no_prompt": '현재 적용한 필터 아래에 프롬프트가 없습니다.',
        "not_implemented": '죄송합니다. 이것은 개발 중인 기능입니다.'
    },
    "deu": {
        "no_prompt": 'Unter dem von Ihnen angewendeten Filter gibt es derzeit keine Eingabeaufforderung.',
        'not_implemented': 'Entschuldigung, dies ist eine Funktion in der Entwicklung.'
    }
}

const prompt_more_dialog_contents = {
    "eng": {
        "title": "Example dialogs",
        "speakers": ["User", "AI Model"],
        "no_dialog": "There are currently no example dialog for this prompt."
    },
    "chn": {
        "title": "示例对话",
        "speakers": ["用户", "AI模型"],
        "no_dialog": "目前此提示词尚无实例对话。"
    },
    "jpn": {
        "title": "ダイアログの例",
        "speakers": ["ユーザー", "AIモデル"],
        "no_dialog": "現在、このプロンプトのダイアログ例はありません。"
    },
    "kor": {
        "title": "예제 대화 상자",
        "speakers": ["사용자", "AI 모델"],
        "no_dialog": "현재 이 프롬프트에 대한 예제 대화 상자가 없습니다."
    },
    "deu": {
        "title": "Beispieldialog",
        "speakers": ["Benutzer", "KI-Modell"],
        "no_dialog": "Für diese Eingabeaufforderung gibt es derzeit keine Beispieldialoge."
    },
}