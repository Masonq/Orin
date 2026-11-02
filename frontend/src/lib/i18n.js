export const dict = {
  ru: {
    nav: {
      assistant: 'Помощник', summary: 'Сводка', comments: 'Комментарии', rules: 'Автоответы',
      calendar: 'Календарь', accounts: 'Аккаунты', plans: 'Тариф', settings: 'Настройки',
    },
    side: {
      search: 'Поиск по разделам', main: 'Основное', workspace: 'Рабочее пространство',
      projects: 'Проекты', night: 'Ночной режим', logout: 'Выйти', collapse: 'Свернуть меню',
      expand: 'Развернуть меню', nothing: 'Ничего не найдено', demo: 'Демо-аккаунт',
    },
    greet: { morning: 'Доброе утро', day: 'Добрый день', evening: 'Добрый вечер', night: 'Доброй ночи' },
    a: {
      idle: 'Готов', listen: 'Слушаю', think: 'Думаю', speak: 'Отвечаю', done: 'Готово',
      hintTap: 'Нажмите на шар или микрофон и спросите: «Что у нас сегодня?»',
      hintInterrupt: 'Нажмите на шар, чтобы перебить',
      hintListen: 'Говорите, я слушаю',
      placeholder: 'Или напишите вопрос',
      send: 'Отправить', mic: 'Сказать голосом', stop: 'Остановить',
      chips: ['Что у нас сегодня?', 'Сколько комментариев без ответа?', 'Какой ролик лучше всего зашёл за неделю?', 'Как работают кодовые слова?', 'Что в очереди?', 'Что публикуем дальше?'],
      noVoice: 'Голосовой ввод недоступен в этом браузере. Напишите вопрос в поле ниже.',
      micDenied: 'Нет доступа к микрофону. Разрешите его в настройках браузера для этого сайта.',
      noSpeech: 'Ничего не услышал. Нажмите на микрофон и говорите чуть громче.',
      open: 'Открыть раздел', you: 'Вы',
      netError: 'Не удалось связаться с сервером. Проверьте интернет и повторите.',
      panelTitle: 'Личный помощник', panelSub: 'Instagram за 7 дней',
    },
    s: {
      reels: 'Ролики', comments: 'Комментарии', replied: 'Ответы', dm: 'Директ',
      week: 'за 7 дней', top: 'Залетел ролик', views: 'просмотров', commentsShort: 'комментариев',
      repliedShort: 'ответов', rate: 'ответили', topics: 'С чем пишут', codewords: 'Кодовые слова',
      tip: 'Рекомендация', reach: 'Охват по дням', allReels: 'Все ролики за неделю', saves: 'сохр.',
      off: 'выкл.', of: 'из', unanswered: 'без ответа',
    },
    c: {
      all: 'Все', unanswered: 'Без ответа', codeword: 'Со словом', reply: 'Ответить',
      replyTo: 'Ответ для', send: 'Отправить ответ', sent: 'Ответ отправлен', quick: 'Быстрые ответы',
      placeholder: 'Текст ответа', emptyUn: 'На все комментарии есть ответ.', emptyCw: 'Комментариев с кодовым словом пока нет.',
      quickReplies: ['Спасибо! Рад, что пригодилось', 'Отправил подробности в директ', 'Напишите на почту, обсудим', 'Монтирую в CapCut'],
      under: 'под роликом', answered: 'Есть ответ',
    },
    r: {
      add: 'Новое правило', edit: 'Правило', keyword: 'Кодовое слово', where: 'Где отвечать',
      comment: 'Комментарий', direct: 'Директ', both: 'Комментарий и директ',
      replyComment: 'Ответ в комментарии', replyDirect: 'Сообщение в директ', save: 'Сохранить',
      create: 'Создать правило', del: 'Удалить правило', delConfirm: 'Нажмите ещё раз, чтобы удалить',
      fired: 'срабатываний', saved: 'Правило сохранено', created: 'Правило создано', deleted: 'Правило удалено',
      exists: 'Такое кодовое слово уже есть', needKw: 'Введите кодовое слово',
      needText: 'Добавьте хотя бы один текст ответа', intro: 'Когда человек пишет кодовое слово, Orin сам отвечает в комментарии и присылает сообщение в директ.',
      empty: 'Правил пока нет. Создайте первое — например, слово «ГАЙД» с ссылкой на материал.',
      on: 'Включено', offState: 'Выключено',
    },
    k: {
      calendar: 'Календарь', queue: 'Очередь', none: 'В этот день ничего не запланировано.',
      published: 'Опубликовано', scheduled: 'Запланировано', draft: 'Черновик',
      waiting: 'Ждёт', sent: 'Отправлено', error: 'Ошибка', retry: 'Повторить', retried: 'Отправлено повторно',
      closed_dm: 'У человека закрыт директ', toComment: 'Ответ в комментарии', toDirect: 'Сообщение в директ',
      allProjects: 'Все проекты', today: 'Сегодня', emptyQueue: 'Очередь пуста.',
      days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    },
    acc: {
      title: 'Аккаунты', demo: 'Демо-данные', followers: 'подписчиков', connect: 'Подключить Instagram',
      soon: 'Подключение появится в следующем обновлении',
      needTitle: 'Что понадобится для подключения',
      need: ['Профессиональный аккаунт Instagram — «Автор» или «Бизнес»', 'Страница Facebook, связанная с этим аккаунтом', 'Вход через Facebook и разрешение на комментарии и директ'],
      now: 'Сейчас Orin работает на демо-данных: цифры и комментарии примерные, ответы никуда не отправляются.',
    },
    p: {
      title: 'Тариф', current: 'Текущий', choose: 'Выбрать', month: '/ мес', soon: 'Оплата появится после запуска',
      plans: [
        { id: 'start', name: 'Старт', price: '0 €', items: ['1 аккаунт', '2 кодовых слова', 'Сводка за день'] },
        { id: 'creator', name: 'Автор', price: '9 €', items: ['2 аккаунта', 'Без лимита кодовых слов', 'Голосовой помощник', 'Календарь публикаций'] },
        { id: 'studio', name: 'Студия', price: '29 €', items: ['10 аккаунтов', 'Команда до 5 человек', 'Отчёты для клиентов', 'Приоритетная очередь'] },
      ],
    },
    set: {
      title: 'Настройки', name: 'Как к вам обращаться', lang: 'Язык', voice: 'Озвучивать ответы',
      rate: 'Скорость речи', theme: 'Тема', themeAuto: 'Как в системе', themeLight: 'Светлая', themeDark: 'Тёмная',
      reset: 'Сбросить демо-данные', resetDone: 'Демо-данные сброшены', photo: 'Фото фона', version: 'Версия',
      logoutTitle: 'Выйти из Orin?', logoutText: 'Настройки на этом устройстве будут сброшены.', logoutOk: 'Выйти', cancel: 'Отмена',
      install: 'Установить на iPhone', installText: 'Откройте сайт в Safari, нажмите «Поделиться» и выберите «На экран Домой».',
    },
    ago: { now: 'только что', m: 'мин', h: 'ч', d: 'дн' },
    close: 'Закрыть', loading: 'Загружаю', retry: 'Повторить',
  },
  en: {
    nav: {
      assistant: 'Assistant', summary: 'Summary', comments: 'Comments', rules: 'Auto-replies',
      calendar: 'Calendar', accounts: 'Accounts', plans: 'Plan', settings: 'Settings',
    },
    side: {
      search: 'Search sections', main: 'Main', workspace: 'Workspace', projects: 'Projects',
      night: 'Night mode', logout: 'Log out', collapse: 'Collapse menu', expand: 'Expand menu',
      nothing: 'Nothing found', demo: 'Demo account',
    },
    greet: { morning: 'Good morning', day: 'Good afternoon', evening: 'Good evening', night: 'Good night' },
    a: {
      idle: 'Ready', listen: 'Listening', think: 'Thinking', speak: 'Speaking', done: 'Done',
      hintTap: 'Tap the orb or the mic and ask: “What is new today?”',
      hintInterrupt: 'Tap the orb to interrupt', hintListen: 'Go ahead, I am listening',
      placeholder: 'Or type a question', send: 'Send', mic: 'Speak', stop: 'Stop',
      chips: ['What is new today?', 'How many comments have no reply?', 'Which reel did best this week?', 'How are codewords doing?', 'What is in the queue?', 'What do we post next?'],
      noVoice: 'Voice input is not available in this browser. Type your question below.',
      micDenied: 'No microphone access. Allow it for this site in your browser settings.',
      noSpeech: 'I did not hear anything. Tap the mic and speak a little louder.',
      open: 'Open section', you: 'You',
      netError: 'Could not reach the server. Check your connection and try again.',
      panelTitle: 'Personal assistant', panelSub: 'Instagram, last 7 days',
    },
    s: {
      reels: 'Reels', comments: 'Comments', replied: 'Replies', dm: 'DMs', week: 'last 7 days',
      top: 'Took off', views: 'views', commentsShort: 'comments', repliedShort: 'replies', rate: 'replied',
      topics: 'What people write', codewords: 'Codewords', tip: 'Recommendation', reach: 'Daily reach',
      allReels: 'All reels this week', saves: 'saves', off: 'off', of: 'of', unanswered: 'no reply',
    },
    c: {
      all: 'All', unanswered: 'No reply', codeword: 'Codeword', reply: 'Reply', replyTo: 'Reply to',
      send: 'Send reply', sent: 'Reply sent', quick: 'Quick replies', placeholder: 'Reply text',
      emptyUn: 'Every comment has a reply.', emptyCw: 'No comments with a codeword yet.',
      quickReplies: ['Thanks! Glad it helped', 'Sent details to your DMs', 'Email me and we will talk', 'I edit in CapCut'],
      under: 'on', answered: 'Replied',
    },
    r: {
      add: 'New rule', edit: 'Rule', keyword: 'Codeword', where: 'Reply in', comment: 'Comment',
      direct: 'DM', both: 'Comment and DM', replyComment: 'Comment reply', replyDirect: 'Direct message',
      save: 'Save', create: 'Create rule', del: 'Delete rule', delConfirm: 'Tap again to delete',
      fired: 'triggers', saved: 'Rule saved', created: 'Rule created', deleted: 'Rule deleted',
      exists: 'This codeword already exists', needKw: 'Enter a codeword', needText: 'Add at least one reply text',
      intro: 'When someone writes a codeword, Orin replies to the comment and sends them a DM.',
      empty: 'No rules yet. Create the first one — for example, “GUIDE” with a link to your material.',
      on: 'On', offState: 'Off',
    },
    k: {
      calendar: 'Calendar', queue: 'Queue', none: 'Nothing planned for this day.',
      published: 'Published', scheduled: 'Scheduled', draft: 'Draft',
      waiting: 'Waiting', sent: 'Sent', error: 'Error', retry: 'Retry', retried: 'Sent again',
      closed_dm: 'This person has closed DMs', toComment: 'Comment reply', toDirect: 'Direct message',
      allProjects: 'All projects', today: 'Today', emptyQueue: 'The queue is empty.',
      days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    },
    acc: {
      title: 'Accounts', demo: 'Demo data', followers: 'followers', connect: 'Connect Instagram',
      soon: 'Connection arrives in the next update', needTitle: 'What you will need',
      need: ['An Instagram professional account — Creator or Business', 'A Facebook Page linked to that account', 'Facebook login with permission for comments and DMs'],
      now: 'Orin is running on demo data: numbers and comments are examples, and replies are not sent anywhere.',
    },
    p: {
      title: 'Plan', current: 'Current', choose: 'Choose', month: '/ mo', soon: 'Payments open after launch',
      plans: [
        { id: 'start', name: 'Start', price: '€0', items: ['1 account', '2 codewords', 'Daily summary'] },
        { id: 'creator', name: 'Creator', price: '€9', items: ['2 accounts', 'Unlimited codewords', 'Voice assistant', 'Publishing calendar'] },
        { id: 'studio', name: 'Studio', price: '€29', items: ['10 accounts', 'Team of up to 5', 'Client reports', 'Priority queue'] },
      ],
    },
    set: {
      title: 'Settings', name: 'What should I call you', lang: 'Language', voice: 'Speak answers aloud',
      rate: 'Speech rate', theme: 'Theme', themeAuto: 'System', themeLight: 'Light', themeDark: 'Dark',
      reset: 'Reset demo data', resetDone: 'Demo data reset', photo: 'Background photo', version: 'Version',
      logoutTitle: 'Log out of Orin?', logoutText: 'Settings on this device will be reset.', logoutOk: 'Log out', cancel: 'Cancel',
      install: 'Install on iPhone', installText: 'Open the site in Safari, tap Share and choose Add to Home Screen.',
    },
    ago: { now: 'just now', m: 'min', h: 'h', d: 'd' },
    close: 'Close', loading: 'Loading', retry: 'Retry',
  },
}

export function greeting(t, d = new Date()) {
  const h = d.getHours()
  if (h >= 5 && h < 12) return t.greet.morning
  if (h >= 12 && h < 17) return t.greet.day
  if (h >= 17 && h < 23) return t.greet.evening
  return t.greet.night
}

export function fmt(n, lang) {
  return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ru-RU').format(n)
}

export function compact(n, lang) {
  return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ru-RU', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function ago(t, minutes) {
  if (minutes < 1) return t.ago.now
  if (minutes < 60) return `${minutes} ${t.ago.m}`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} ${t.ago.h}`
  return `${Math.floor(minutes / 1440)} ${t.ago.d}`
}
