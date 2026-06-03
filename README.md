# Portfolio

Статический сайт-портфолио Константина Попова.

## Как менять видео в телевизоре и работы без правки кода

Контент вынесен в файл [`data/portfolio.json`](data/portfolio.json).

### Видео в начале страницы

Блок `tvChannels` отвечает за ролики в интерактивном телевизоре:

```json
{
  "id": 1,
  "title": "INSPIRATION",
  "src": "videos/vdohnovenie.mp4"
}
```

- `id` — номер канала на экране.
- `title` — название ролика.
- `src` — путь к видео. Если видео лежит в папке `videos`, указывай `videos/name.mp4`.

Чтобы добавить ролик, загрузи `.mp4` в папку `videos` и добавь новый объект в `tvChannels`.
Чтобы убрать ролик, удали его объект из `tvChannels`.

### SELECTED_WORKS

Блок `selectedWorks` отвечает за карточки работ:

```json
{
  "title": "INSPIRATION",
  "category": "(REELS / VERTICAL)",
  "url": "https://vimeo.com/1132747852?fl=ip&fe=ec",
  "image": "images/project-festival.jpg",
  "alt": "Inspiration - Creative Reels, vertical format"
}
```

- `title` — название карточки.
- `category` — подпись справа, например `(DOCUMENTARY)`.
- `url` — ссылка на видео или проект.
- `image` — превью-картинка. Если картинка лежит в `images`, указывай `images/name.jpg`.
- `alt` — короткое описание картинки для доступности.

Чтобы скрыть карточку, удали ее объект из `selectedWorks`.
Чтобы добавить карточку, загрузи превью в `images` и добавь новый объект в `selectedWorks`.

После изменения `data/portfolio.json` GitHub Pages обновит сайт после публикации изменений.
