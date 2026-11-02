"""Демо-данные Orin. Позже заменяются данными Instagram Graph API."""
from datetime import date, timedelta

ACCOUNT = {
    "id": "acc_demo",
    "handle": "kadr.studio",
    "name": "Кадр. Студия монтажа",
    "followers": 48200,
    "avatar": "KS",
    "connected": False,
}

REELS = [
    {"id": "r1", "title": {"ru": "Монтаж рилса за 15 минут", "en": "Editing a reel in 15 minutes"},
     "views": 412000, "comments": 938, "replied": 797, "likes": 31800, "saves": 6100, "hue": 28, "posted_days_ago": 2},
    {"id": "r2", "title": {"ru": "Три ошибки в свете дома", "en": "Three home lighting mistakes"},
     "views": 96400, "comments": 214, "replied": 201, "likes": 7400, "saves": 1900, "hue": 200, "posted_days_ago": 4},
    {"id": "r3", "title": {"ru": "Сетап для съёмки на телефон", "en": "Phone filming setup"},
     "views": 71200, "comments": 156, "replied": 149, "likes": 5200, "saves": 2300, "hue": 150, "posted_days_ago": 6},
    {"id": "r4", "title": {"ru": "Цветокор в CapCut", "en": "Color grading in CapCut"},
     "views": 54800, "comments": 98, "replied": 92, "likes": 3900, "saves": 1400, "hue": 300, "posted_days_ago": 9},
    {"id": "r5", "title": {"ru": "Чистый звук без петлички", "en": "Clean audio without a lav mic"},
     "views": 38900, "comments": 77, "replied": 70, "likes": 2800, "saves": 900, "hue": 50, "posted_days_ago": 12},
]

# охваты за 7 дней, от самого старого к сегодняшнему
REACH_7D = [18400, 21900, 19700, 64300, 132800, 98500, 71200]

TOPICS = [
    {"key": "link", "label": {"ru": "Просят ссылку на урок", "en": "Ask for the lesson link"}, "share": 0.46},
    {"key": "gear", "label": {"ru": "Спрашивают про технику", "en": "Ask about gear"}, "share": 0.27},
    {"key": "praise", "label": {"ru": "Благодарят и хвалят", "en": "Say thanks"}, "share": 0.18},
    {"key": "collab", "label": {"ru": "Предлагают сотрудничество", "en": "Offer collaborations"}, "share": 0.09},
]

COMMENTS = [
    {"id": "c1", "reel": "r1", "author": "anya.frames", "text": "МОНТАЖ", "minutes_ago": 3, "codeword": "МОНТАЖ"},
    {"id": "c2", "reel": "r1", "author": "dmitry_vlog", "text": "А на каком приложении монтируешь? Выглядит очень чисто", "minutes_ago": 7, "codeword": None},
    {"id": "c3", "reel": "r1", "author": "lena.makes", "text": "МОНТАЖ пожалуйста!", "minutes_ago": 11, "codeword": "МОНТАЖ"},
    {"id": "c4", "reel": "r3", "author": "sergey.shoots", "text": "Какой штатив на видео? Хочу такой же", "minutes_ago": 18, "codeword": None},
    {"id": "c5", "reel": "r3", "author": "kate_on_air", "text": "СЕТАП", "minutes_ago": 26, "codeword": "СЕТАП"},
    {"id": "c6", "reel": "r2", "author": "mira.content", "text": "Спасибо, наконец поняла, почему у меня жёлтая картинка", "minutes_ago": 34, "codeword": None},
    {"id": "c7", "reel": "r1", "author": "brand.light", "text": "Здравствуйте! Хотим обсудить интеграцию, куда написать?", "minutes_ago": 41, "codeword": None},
    {"id": "c8", "reel": "r4", "author": "oleg.edit", "text": "Можно пресет цветокора?", "minutes_ago": 57, "codeword": None},
    {"id": "c9", "reel": "r1", "author": "polina.reels", "text": "МОНТАЖ", "minutes_ago": 64, "codeword": "МОНТАЖ"},
    {"id": "c10", "reel": "r5", "author": "artem.sound", "text": "Попробовал шумодав, как ты показал. Работает!", "minutes_ago": 80, "codeword": None},
    {"id": "c11", "reel": "r2", "author": "nastya.home", "text": "А лампу какую брать для начала?", "minutes_ago": 95, "codeword": None},
    {"id": "c12", "reel": "r3", "author": "vlad.creator", "text": "СЕТАП", "minutes_ago": 120, "codeword": "СЕТАП"},
]

DEFAULT_RULES = [
    {"id": "rule1", "keyword": "МОНТАЖ", "where": "both", "enabled": True, "fired": 472,
     "reply_comment": "Отправил урок тебе в директ",
     "reply_direct": "Держи урок по монтажу: kadr.studio/lesson. Если появятся вопросы, пиши сюда."},
    {"id": "rule2", "keyword": "СЕТАП", "where": "both", "enabled": True, "fired": 138,
     "reply_comment": "Список техники уже у тебя в директе",
     "reply_direct": "Мой сетап: телефон, штатив с головой, лампа 60 Вт, петличка. Ссылки на всё: kadr.studio/gear"},
    {"id": "rule3", "keyword": "ГАЙД", "where": "direct", "enabled": False, "fired": 0,
     "reply_comment": "",
     "reply_direct": "Гайд по съёмке дома: kadr.studio/guide"},
]

PROJECTS = [
    {"id": "reels", "label": {"ru": "Рилсы", "en": "Reels"}, "color": "#F3C277"},
    {"id": "stories", "label": {"ru": "Сторис", "en": "Stories"}, "color": "#7FE7E0"},
    {"id": "collab", "label": {"ru": "Коллаборации", "en": "Collabs"}, "color": "#B49BFF"},
]


def calendar(today: date):
    items = [
        (-6, "10:00", "reels", {"ru": "Сетап для съёмки на телефон", "en": "Phone filming setup"}, "published"),
        (-4, "19:00", "reels", {"ru": "Три ошибки в свете дома", "en": "Three home lighting mistakes"}, "published"),
        (-2, "18:30", "reels", {"ru": "Монтаж рилса за 15 минут", "en": "Editing a reel in 15 minutes"}, "published"),
        (0, "20:00", "stories", {"ru": "Опрос: какую тему разобрать", "en": "Poll: what to cover next"}, "scheduled"),
        (1, "19:00", "reels", {"ru": "Переходы без плагинов", "en": "Transitions without plugins"}, "scheduled"),
        (3, "12:00", "collab", {"ru": "Интеграция с brand.light", "en": "brand.light integration"}, "draft"),
        (4, "19:00", "reels", {"ru": "Как снимать руки крупно", "en": "Filming hands up close"}, "scheduled"),
        (7, "18:00", "stories", {"ru": "Закулисье съёмки", "en": "Behind the scenes"}, "draft"),
        (9, "19:00", "reels", {"ru": "Субтитры за минуту", "en": "Subtitles in a minute"}, "draft"),
        (12, "19:00", "reels", {"ru": "Разбор ваших рилсов", "en": "Reviewing your reels"}, "draft"),
    ]
    out = []
    for i, (d, t, proj, title, status) in enumerate(items):
        out.append({"id": f"p{i}", "date": (today + timedelta(days=d)).isoformat(), "time": t,
                    "project": proj, "title": title, "status": status})
    return out
