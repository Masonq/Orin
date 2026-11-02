#!/usr/bin/env bash
# Деплой Orin: ставит зависимости, поднимает API и nginx, выпускает HTTPS, проверяет и пишет отчёт в git.
set -uo pipefail
export GIT_TERMINAL_PROMPT=0
APP=/opt/orin
DOMAIN=orin.89-208-113-147.sslip.io
PORT=8710
TS=$(date -u +%Y%m%d-%H%M%S)
REPORT="$APP/reports/deploy-latest.txt"
mkdir -p "$APP/reports"
exec > >(tee "$REPORT") 2>&1
step() { echo; echo "== $*"; }
fail() { echo "ОШИБКА: $*"; finish 1; }
finish() {
  echo; echo "== Итог: $([ "${1:-0}" = 0 ] && echo УСПЕХ || echo ОШИБКА) ($TS UTC)"
  cd "$APP" && git add reports/deploy-latest.txt >/dev/null 2>&1 && git -c user.name="orin-server" -c user.email="orin@server" commit -qm "deploy report $TS" >/dev/null 2>&1
  git pull -q --rebase >/dev/null 2>&1
  if PUSH_ERR=$(git push -q 2>&1); then echo "отчёт отправлен в git"; else echo "не удалось отправить отчёт в git: $PUSH_ERR"; fi
  exit "${1:-0}"
}

cd "$APP" || exit 1
step "Версия"
git log -1 --format='%h %s'
VERSION=$(python3 -c "import json;print(json.load(open('frontend/dist/version.json'))['version'])" 2>/dev/null || echo unknown)
echo "сборка: $VERSION"
echo "ORIN_VERSION=$VERSION" > deploy/version.env

step "Пакеты"
NEED=""
for p in nginx python3-venv certbot python3-certbot-nginx; do dpkg -s "$p" >/dev/null 2>&1 || NEED="$NEED $p"; done
if [ -n "$NEED" ]; then
  echo "ставлю:$NEED"
  DEBIAN_FRONTEND=noninteractive apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq $NEED || fail "apt не поставил$NEED"
else echo "всё уже стоит"; fi

step "Python-окружение"
[ -x .venv/bin/python ] || python3 -m venv .venv || fail "venv"
.venv/bin/pip install -q --upgrade pip >/dev/null 2>&1
.venv/bin/pip install -q -r backend/requirements.txt || fail "pip install"
echo "ok"

step "Порт $PORT"
OWNER=$(ss -ltnp "sport = :$PORT" 2>/dev/null | awk 'NR>1{print $NF}' | head -1)
if [ -n "$OWNER" ] && ! echo "$OWNER" | grep -q uvicorn; then fail "порт $PORT занят: $OWNER"; fi
echo "свободен или занят самим Orin"

step "Сервис API"
mkdir -p /var/lib/orin
cp deploy/orin.service /etc/systemd/system/orin.service
systemctl daemon-reload
systemctl enable -q orin
systemctl restart orin
sleep 2
systemctl is-active --quiet orin || { journalctl -u orin -n 40 --no-pager; fail "сервис orin не запустился"; }
curl -fsS "http://127.0.0.1:$PORT/api/health" && echo

step "nginx и HTTPS"
CONF=/etc/nginx/sites-available/orin.conf
CERT=/etc/letsencrypt/live/$DOMAIN
write_http() {
  { echo "server {"; echo "    listen 80;"; echo "    server_name $DOMAIN;"; cat deploy/nginx-body.conf; echo "}"; } > "$CONF"
}
write_https() {
  { echo "server {"; echo "    listen 80;"; echo "    server_name $DOMAIN;"
    echo "    location /.well-known/acme-challenge/ { root $APP/frontend/dist; }"
    echo "    location / { return 301 https://\$host\$request_uri; }"; echo "}"
    echo "server {"; echo "    listen 443 ssl;"; echo "    server_name $DOMAIN;"
    echo "    ssl_certificate $CERT/fullchain.pem;"; echo "    ssl_certificate_key $CERT/privkey.pem;"
    echo "    ssl_protocols TLSv1.2 TLSv1.3;"
    cat deploy/nginx-body.conf; echo "}"; } > "$CONF"
}
ln -sf "$CONF" /etc/nginx/sites-enabled/orin.conf
if [ ! -f "$CERT/fullchain.pem" ]; then
  write_http
  nginx -t || fail "nginx -t (http)"
  systemctl reload nginx || fail "nginx reload"
  certbot certonly --webroot -w "$APP/frontend/dist" -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --keep-until-expiring \
    || echo "certbot не выпустил сертификат — сайт пока работает по http"
fi
if [ -f "$CERT/fullchain.pem" ]; then
  write_https
  nginx -t || fail "nginx -t (https)"
  SCHEME=https
else SCHEME=http; fi
systemctl reload nginx || fail "nginx reload"
echo "ok, схема: $SCHEME"

step "Проверка снаружи"
for u in "$SCHEME://$DOMAIN/" "$SCHEME://$DOMAIN/api/health" "$SCHEME://$DOMAIN/sw.js" "$SCHEME://$DOMAIN/version.json"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$u"); echo "$code $u"
done
echo "cache-control index: $(curl -sI --max-time 10 "$SCHEME://$DOMAIN/" | grep -i cache-control | tr -d '\r')"
LIVE=$(curl -s --max-time 10 "$SCHEME://$DOMAIN/version.json")
echo "версия на сайте: $LIVE"
echo "$LIVE" | grep -q "$VERSION" || fail "на сайте не та версия"
finish 0
