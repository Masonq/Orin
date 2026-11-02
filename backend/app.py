import json
import os
import re
import sqlite3
import threading
import time
import uuid
from datetime import date, datetime

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

import demo

DB_PATH = os.environ.get("ORIN_DB", os.path.join(os.path.dirname(__file__), "orin.db"))
_lock = threading.Lock()

app = FastAPI(title="Orin API", docs_url=None, redoc_url=None)


# ---------- хранилище ----------
def _conn():
    c = sqlite3.connect(DB_PATH)
    c.execute("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)")
    return c


def kv_get(key, default):
    with _lock, _conn() as c:
        row = c.execute("SELECT v FROM kv WHERE k=?", (key,)).fetchone()
    return json.loads(row[0]) if row else default


def kv_set(key, value):
    with _lock, _conn() as c:
        c.execute("INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v",
                  (key, json.dumps(value, ensure_ascii=False)))


def rules():
    r = kv_get("rules", None)
    if r is None:
        r = demo.DEFAULT_RULES
        kv_set("rules", r)
    return r


def replies():
    return kv_get("replies", {})


def queue():
    q = kv_get("queue", None)
    if q is None:
        now = int(time.time())
        q = [
            {"id": "q1", "kind": "direct", "to": "anya.frames", "rule": "МОНТАЖ", "status": "waiting", "ts": now - 60},
            {"id": "q2", "kind": "direct", "to": "lena.makes", "rule": "МОНТАЖ", "status": "waiting", "ts": now - 240},
            {"id": "q3", "kind": "direct", "to": "kate_on_air", "rule": "СЕТАП", "status": "sent", "ts": now - 1300},
            {"id": "q4", "kind": "comment", "to": "polina.reels", "rule": "МОНТАЖ", "status": "sent", "ts": now - 3600},
            {"id": "q5", "kind": "direct", "to": "vlad.creator", "rule": "СЕТАП", "status": "error", "ts": now - 6900,
             "error": "closed_dm"},
        ]
        kv_set("queue", q)
    return q


def tr(v, lang):
    return v.get(lang) or v.get("ru") if isinstance(v, dict) else v


# ---------- сводка ----------
def comments_view(lang):
    rep = replies()
    out = []
    for c in demo.COMMENTS:
        reel = next(r for r in demo.REELS if r["id"] == c["reel"])
        out.append({**c, "reel_title": tr(reel["title"], lang), "reply": rep.get(c["id"]),
                    "answered": c["id"] in rep})
    return out


def summary(lang):
    cm = comments_view(lang)
    unanswered = sum(1 for c in cm if not c["answered"])
    top = max(demo.REELS, key=lambda r: r["views"])
    total_comments = sum(r["comments"] for r in demo.REELS)
    total_replied = sum(r["replied"] for r in demo.REELS) + len(replies())
    mon = next((r for r in rules() if r["keyword"] == "МОНТАЖ"), None)
    dm_sent = sum(r["fired"] for r in rules())
    dm_total = dm_sent + 3
    return {
        "kpi": {
            "reels": len(demo.REELS),
            "comments": total_comments,
            "replied": total_replied,
            "dm_sent": dm_sent,
            "dm_total": dm_total,
            "unanswered": unanswered,
        },
        "spark": {
            "reels": [1, 0, 1, 0, 1, 1, 1],
            "comments": [42, 61, 55, 188, 402, 251, 164],
            "replied": [40, 58, 52, 170, 351, 228, 150],
            "dm": [12, 15, 14, 98, 161, 102, 70],
        },
        "reach": demo.REACH_7D,
        "top": {**top, "title": tr(top["title"], lang), "rate": round(top["replied"] / top["comments"], 2)},
        "reels": [{**r, "title": tr(r["title"], lang)} for r in demo.REELS],
        "codewords": [{"word": r["keyword"], "count": r["fired"], "enabled": r["enabled"]} for r in rules()],
        "topics": [{"key": t["key"], "label": tr(t["label"], lang), "share": t["share"]} for t in demo.TOPICS],
        "tip": {
            "ru": "Ролик про монтаж зашёл в 6 раз лучше обычного. Снимите продолжение в течение двух дней, пока к нему есть интерес, и закрепите комментарий с кодовым словом МОНТАЖ.",
            "en": "The editing reel did 6× better than usual. Film a follow-up within two days while interest is high, and pin a comment with the codeword МОНТАЖ.",
        }[lang],
        "monitored_rule": mon["keyword"] if mon else None,
    }


@app.get("/api/health")
def health():
    return {"ok": True, "version": os.environ.get("ORIN_VERSION", "dev")}


@app.get("/api/state")
def state(lang: str = "ru"):
    lang = "en" if lang == "en" else "ru"
    return {
        "account": demo.ACCOUNT,
        "summary": summary(lang),
        "comments": comments_view(lang),
        "rules": rules(),
        "queue": sorted(queue(), key=lambda x: -x["ts"]),
        "projects": [{**p, "label": tr(p["label"], lang)} for p in demo.PROJECTS],
        "calendar": [{**p, "title": tr(p["title"], lang)} for p in demo.calendar(date.today())],
        "server_time": datetime.now().isoformat(timespec="seconds"),
    }


# ---------- комментарии ----------
class ReplyIn(BaseModel):
    text: str = Field(min_length=1, max_length=2200)


@app.post("/api/comments/{cid}/reply")
def reply(cid: str, body: ReplyIn):
    c = next((c for c in demo.COMMENTS if c["id"] == cid), None)
    if not c:
        raise HTTPException(404, "comment_not_found")
    rep = replies()
    rep[cid] = body.text.strip()
    kv_set("replies", rep)
    q = queue()
    q.append({"id": "q" + uuid.uuid4().hex[:8], "kind": "comment", "to": c["author"], "rule": None,
              "status": "sent", "ts": int(time.time())})
    kv_set("queue", q)
    return {"ok": True}


# ---------- правила ----------
class RuleIn(BaseModel):
    keyword: str = Field(min_length=1, max_length=40)
    where: str = Field(pattern="^(comment|direct|both)$")
    enabled: bool = True
    reply_comment: str = Field(default="", max_length=2200)
    reply_direct: str = Field(default="", max_length=1000)


def _norm_kw(s):
    return re.sub(r"\s+", " ", s.strip()).upper()


@app.post("/api/rules")
def rule_create(body: RuleIn):
    r = rules()
    kw = _norm_kw(body.keyword)
    if any(x["keyword"] == kw for x in r):
        raise HTTPException(409, "keyword_exists")
    item = {"id": "rule" + uuid.uuid4().hex[:6], **body.model_dump(), "keyword": kw, "fired": 0}
    r.append(item)
    kv_set("rules", r)
    return item


@app.put("/api/rules/{rid}")
def rule_update(rid: str, body: RuleIn):
    r = rules()
    kw = _norm_kw(body.keyword)
    if any(x["keyword"] == kw and x["id"] != rid for x in r):
        raise HTTPException(409, "keyword_exists")
    for i, x in enumerate(r):
        if x["id"] == rid:
            r[i] = {**x, **body.model_dump(), "keyword": kw}
            kv_set("rules", r)
            return r[i]
    raise HTTPException(404, "rule_not_found")


@app.delete("/api/rules/{rid}")
def rule_delete(rid: str):
    r = rules()
    n = [x for x in r if x["id"] != rid]
    if len(n) == len(r):
        raise HTTPException(404, "rule_not_found")
    kv_set("rules", n)
    return {"ok": True}


@app.post("/api/queue/{qid}/retry")
def queue_retry(qid: str):
    q = queue()
    for x in q:
        if x["id"] == qid:
            x["status"] = "sent"
            x.pop("error", None)
            x["ts"] = int(time.time())
            kv_set("queue", q)
            return x
    raise HTTPException(404, "queue_item_not_found")


@app.post("/api/demo/reset")
def demo_reset():
    for k in ("rules", "replies", "queue"):
        with _lock, _conn() as c:
            c.execute("DELETE FROM kv WHERE k=?", (k,))
    return {"ok": True}


# ---------- помощник ----------
class AskIn(BaseModel):
    q: str = Field(min_length=1, max_length=500)
    lang: str = "ru"


STEPS = {
    "ru": {
        "open": "Открываю Instagram",
        "find": "Ищу ролик, который залетел",
        "read": "Читаю комментарии",
        "count": "Считаю ответы",
        "advice": "Готовлю совет",
        "rules": "Проверяю автоответы",
        "queue": "Смотрю очередь отправки",
        "plan": "Открываю календарь",
    },
    "en": {
        "open": "Opening Instagram",
        "find": "Finding the reel that took off",
        "read": "Reading comments",
        "count": "Counting replies",
        "advice": "Preparing advice",
        "rules": "Checking auto-replies",
        "queue": "Checking the send queue",
        "plan": "Opening the calendar",
    },
}


def _fmt(n, lang):
    s = f"{n:,}".replace(",", " " if lang == "ru" else ",")
    return s


def ru_plural(n, one, few, many):
    n = abs(n) % 100
    if 11 <= n <= 19:
        return many
    n %= 10
    return one if n == 1 else few if 2 <= n <= 4 else many


def detect_intent(q):
    s = q.lower()
    if re.search(r"без ответа|не ответ|unanswer|no reply|without repl", s):
        return "unanswered"
    if re.search(r"лучш|топ|залет|зашёл|зашел|best|top|viral", s):
        return "best"
    if re.search(r"кодов|слово|автоответ|codeword|keyword|auto.?repl", s):
        return "codewords"
    if re.search(r"очеред|отправ|директ|queue|direct|dm", s):
        return "queue"
    if re.search(r"план|календар|публикац|завтра|schedule|calendar|plan|tomorrow", s):
        return "plan"
    if re.search(r"сегодня|что у нас|сводк|итог|today|summary|what.?s up|how are we", s):
        return "today"
    if re.search(r"привет|здравств|hello|hi\b|hey", s):
        return "hello"
    return "fallback"


@app.post("/api/ask")
def ask(body: AskIn):
    lang = "en" if body.lang == "en" else "ru"
    st = STEPS[lang]
    sm = summary(lang)
    k = sm["kpi"]
    top = sm["top"]
    intent = detect_intent(body.q)
    mon_fired = next((r["fired"] for r in rules() if r["keyword"] == "МОНТАЖ"), 0)
    cal = [p for p in demo.calendar(date.today()) if p["status"] != "published"]
    nxt = cal[0] if cal else None
    q = queue()
    waiting = sum(1 for x in q if x["status"] == "waiting")
    errors = sum(1 for x in q if x["status"] == "error")

    if intent == "today":
        steps = [st["open"], st["find"], st["read"], st["count"], st["advice"]]
        ans = {
            "ru": f"У нас залетел ролик «{top['title']}»: {_fmt(top['views'], lang)} просмотров и {_fmt(top['comments'], lang)} комментариев. "
                  f"Ответили на {round(top['rate'] * 100)}%. По слову МОНТАЖ ушло {_fmt(mon_fired, lang)} {ru_plural(mon_fired, 'сообщение', 'сообщения', 'сообщений')} в директ. "
                  f"Без ответа {ru_plural(k['unanswered'], 'остался', 'осталось', 'осталось')} {k['unanswered']} {ru_plural(k['unanswered'], 'свежий комментарий', 'свежих комментария', 'свежих комментариев')}. Совет: снимите продолжение, пока к теме есть интерес.",
            "en": f"Your reel “{top['title']}” took off: {_fmt(top['views'], lang)} views and {_fmt(top['comments'], lang)} comments. "
                  f"You replied to {round(top['rate'] * 100)}%. The МОНТАЖ codeword sent {_fmt(mon_fired, lang)} DMs. "
                  f"{k['unanswered']} fresh comments are still waiting. Tip: film a follow-up while the topic is hot.",
        }[lang]
        go = "summary"
    elif intent == "unanswered":
        steps = [st["open"], st["read"], st["count"]]
        ans = {
            "ru": f"Без ответа {k['unanswered']} {ru_plural(k['unanswered'], 'комментарий', 'комментария', 'комментариев')}. Больше всего под роликом «{top['title']}». Самый важный: brand.light предлагает интеграцию.",
            "en": f"{k['unanswered']} comments have no reply. Most are under “{top['title']}”. The important one: brand.light wants an integration.",
        }[lang]
        go = "comments"
    elif intent == "best":
        steps = [st["open"], st["find"], st["count"]]
        ans = {
            "ru": f"Лучше всего за неделю зашёл «{top['title']}»: {_fmt(top['views'], lang)} просмотров, {_fmt(top['saves'], lang)} сохранений. Это в шесть раз выше вашего среднего.",
            "en": f"Best this week: “{top['title']}” with {_fmt(top['views'], lang)} views and {_fmt(top['saves'], lang)} saves. That is six times your average.",
        }[lang]
        go = "summary"
    elif intent == "codewords":
        steps = [st["rules"], st["count"]]
        active = [c for c in sm["codewords"] if c["enabled"]]
        words = ", ".join(f"{c['word']} — {_fmt(c['count'], lang)}" for c in active) or "—"
        ans = {
            "ru": f"{ru_plural(len(active), 'Работает', 'Работают', 'Работают')} {len(active)} {ru_plural(len(active), 'кодовое слово', 'кодовых слова', 'кодовых слов')}: {words}.",
            "en": f"{len(active)} active codeword{'s' if len(active) != 1 else ''}: {words}.",
        }[lang]
        go = "rules"
    elif intent == "queue":
        steps = [st["queue"]]
        ans = {
            "ru": f"В очереди {waiting} {ru_plural(waiting, 'сообщение ждёт', 'сообщения ждут', 'сообщений ждут')} отправки, ошибок: {errors}. Ошибка бывает, когда у человека закрыт директ.",
            "en": f"{waiting} messages are waiting in the queue, errors: {errors}. Errors happen when someone has closed DMs.",
        }[lang]
        go = "calendar"
    elif intent == "plan":
        steps = [st["plan"]]
        if nxt:
            dd = (date.fromisoformat(nxt["date"]) - date.today()).days
            when = {0: {"ru": "сегодня", "en": "today"}, 1: {"ru": "завтра", "en": "tomorrow"}}.get(dd)
            when = when[lang] if when else (f"{nxt['date'][8:10]}.{nxt['date'][5:7]}" if lang == "ru" else f"on {nxt['date'][5:7]}/{nxt['date'][8:10]}")
            ans = {
                "ru": f"Следующая публикация — «{tr(nxt['title'], lang)}», {when} в {nxt['time']}.",
                "en": f"Next post: “{tr(nxt['title'], lang)}”, {when} at {nxt['time']}.",
            }[lang]
        else:
            ans = {"ru": "В календаре пока пусто.", "en": "The calendar is empty."}[lang]
        go = "calendar"
    elif intent == "hello":
        steps = []
        ans = {"ru": "Добрый вечер. Спросите, что у нас сегодня, и я соберу сводку.",
               "en": "Good evening. Ask me what is new today and I will put together a summary."}[lang]
        go = None
    else:
        steps = [st["read"]]
        ans = {
            "ru": "Пока я умею рассказывать о сводке за день, комментариях без ответа, лучшем ролике, кодовых словах, очереди и календаре. Спросите об этом.",
            "en": "For now I can tell you about today's summary, unanswered comments, the best reel, codewords, the queue and the calendar.",
        }[lang]
        go = None
    return {"intent": intent, "steps": steps, "answer": ans, "go": go}


# Локальная проверка без nginx: ORIN_STATIC=путь к dist
if os.environ.get("ORIN_STATIC"):
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=os.environ["ORIN_STATIC"], html=True), name="static")
