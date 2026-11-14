# kzbible — сайт Библейского общества Казахстана

Payload CMS 3 + Next.js 16 + SQLite. Один проект: сайт и админка (`/admin`).

## Что внутри
- **Коллекции:** Статьи, Новости, Книги (бесплатные/платные, цена в ₸, наличие), Файлы для скачивания, Рубрики, Изображения, Пользователи.
- **Роли:** `admin` (всё), `editor` (публикует), `author` (пишет черновики, видит только свои).
- **SEO:** поля title/description/OG-картинка у каждой записи, ЧПУ из заголовка (кириллица и қазақша → латиница), canonical, JSON-LD (Article, Product), `sitemap.xml`, `robots.txt`.
- **Скорость:** страницы кэшируются (ISR, 5 мин), фото автоматически в WebP нужных размеров, нет лишнего JS на публичных страницах.
- **Платные файлы:** `Файлы → «Закрытый»` — прямой ссылки нет, отдаёт только авторизованный пользователь. Автовыдача после оплаты — следующий этап.

## Запуск локально
```bash
cp .env.example .env   # задайте PAYLOAD_SECRET
npm install
npm run dev            # http://localhost:3000, админка /admin
```
Первый зашедший на `/admin` создаёт администратора.

## Деплой на VPS (Hostinger, Ubuntu)
```bash
# один раз: Node 22, nginx, pm2
git clone <repo> /var/www/kzbible && cd /var/www/kzbible
cp .env.example .env     # DATABASE_URL=file:/var/lib/kzbible/kzbible.db, NEXT_PUBLIC_SITE_URL=https://kzbible.com
npm ci && npm run build  # build сам применяет миграции БД
pm2 start npm --name kzbible -- start && pm2 save
```
Nginx проксирует `kzbible.com` → `localhost:3000`, HTTPS через certbot. Для `/media` и `/api/downloads` увеличьте `client_max_body_size` (например `100m`).

**Бэкап:** копируйте файл БД и папку `media/` (например, ночным cron).

## При изменении коллекций
```bash
npm run payload migrate:create <name>   # создать миграцию, закоммитить
npm run generate:types
```

## Миграция с WordPress
1. В старой админке: Инструменты → Экспорт → «Все содержимое» → скачать `.xml`.
2. `npm run import:wp -- export.xml --images` — статьи, новости (рубрика «Новости»), товары → книги; `--images` скачивает фото (нужен доступ к старому сайту).
3. Создаётся `redirects.json` — 301-редиректы подключаются автоматически (`next.config.ts`). Закоммитьте его.
Старые URL нужно сохранить или настроить 301-редиректы (`next.config.ts → redirects`). Перед запуском на боевом домене снять `Disallow: /` в старом robots.txt.
