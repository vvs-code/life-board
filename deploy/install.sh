#!/usr/bin/env sh
# Установка одной командой (NFR-1, NFR-2):
#   curl -fsSL https://github.com/vvs-code/life-board/releases/latest/download/install.sh | sh -s -- --domain life.example.com
# Единственный параметр от человека — домен. Остальное генерируется, .env руками не правится.
set -eu

DOMAIN=""
LOCAL=0
AUTO_UPDATE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2 ;;
    --local) LOCAL=1; DOMAIN="localhost"; shift ;;
    --auto-update) AUTO_UPDATE=1; shift ;;
    *) echo "неизвестный флаг: $1" >&2; exit 1 ;;
  esac
done
[ -n "$DOMAIN" ] || { echo "нужен --domain <домен> или --local" >&2; exit 1; }

DIR="${LIFEBOARD_DIR:-/opt/lifeboard}"
VERSION="${LIFEBOARD_VERSION:-latest}"
RELEASE="https://github.com/vvs-code/life-board/releases/download/${VERSION}"
mkdir -p "$DIR" && cd "$DIR"

curl -fsSL "$RELEASE/compose.yaml" -o compose.yaml
curl -fsSL "$RELEASE/Caddyfile" -o Caddyfile
curl -fsSL "$RELEASE/lifeboard" -o /usr/local/bin/lifeboard && chmod +x /usr/local/bin/lifeboard

POSTGRES_PASSWORD="$(openssl rand -hex 24)"
SETUP_TOKEN="$(openssl rand -hex 16)"
cat > .env <<ENV
# Файл пишет установщик и команда lifeboard. Руками не редактировать.
DOMAIN=$DOMAIN
PUBLIC_URL=https://$DOMAIN
LIFEBOARD_VERSION=$VERSION
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
DATABASE_URL=postgres://lifeboard:$POSTGRES_PASSWORD@postgres:5432/lifeboard
ENCRYPTION_KEY=$(openssl rand -hex 32)
SETUP_TOKEN=$SETUP_TOKEN
ENV
chmod 600 .env

docker compose up -d

if [ "$AUTO_UPDATE" = 1 ]; then
  # cron на хосте, а не в контейнере: приложению не нужен docker.sock (NFR-10)
  (crontab -l 2>/dev/null; echo "0 4 * * * /usr/local/bin/lifeboard update") | crontab -
fi

echo
echo "Готово. Откройте https://$DOMAIN/setup"
echo "Токен мастера первого запуска: $SETUP_TOKEN"
