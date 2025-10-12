# 🎸 Country MTV - Billboard Hits Player

Una aplicación web estilo MTV que reproduce automáticamente los videos de las Top 5 canciones Country de Billboard con sus videos oficiales de YouTube.

## ✨ Características

- 🎵 Extrae automáticamente las Top 5 canciones de Billboard Hot Country Songs
- 🎬 Busca y reproduce los videos oficiales de YouTube
- 🔄 Autoplay: Los videos se reproducen automáticamente uno tras otro
- 🎨 Interfaz moderna estilo MTV con diseño responsive
- ⌨️ Controles por teclado para navegación rápida
- 📱 Compatible con dispositivos móviles

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar API Key de OpenAI

Asegúrate de tener tu API key en el archivo `.env`:

```
OPENAI_API_KEY=tu-api-key-aqui
```

### 3. Ejecutar todo de una vez

```bash
npm run dev
```

Este comando:
1. Extrae las canciones de Billboard
2. Busca los videos de YouTube
3. Inicia el servidor web

Luego abre tu navegador en: **http://localhost:3000**

## 📝 Comandos Disponibles

```bash
# Extraer canciones y buscar videos de YouTube
npm run scrape

# Iniciar solo el servidor web
npm run serve

# Hacer ambas cosas
npm run dev
```

## ⌨️ Controles

### En la Web:
- **Click** en una canción del playlist para reproducirla
- **Flecha Derecha** o **N**: Siguiente canción
- **Flecha Izquierda** o **P**: Canción anterior
- **Espacio**: Play/Pausa

### Autoplay:
Los videos se reproducen automáticamente en secuencia. Cuando un video termina, el siguiente comienza automáticamente.

## 📁 Estructura del Proyecto

```
my-stagehand-app/
├── public/                    # Archivos del frontend
│   ├── index.html            # Página principal
│   ├── style.css             # Estilos MTV
│   ├── app.js                # Lógica del player
│   └── playlist.json         # Datos de canciones (generado)
├── scraper-with-youtube.ts   # Scraper de Billboard + YouTube
├── server.ts                 # Servidor Express
├── simple-ai-scraper.ts      # Scraper simple (sin YouTube)
└── index.ts                  # Scraper con Stagehand
```

## 🎨 Personalización

### Cambiar cantidad de canciones

Edita `scraper-with-youtube.ts` y cambia el número 5 por la cantidad deseada:

```typescript
// Busca esta línea y cambia minItems y maxItems
minItems: 5,
maxItems: 5
```

### Cambiar estilos

Edita `public/style.css` para personalizar colores, fuentes y diseño.

### Cambiar modelo de IA

En `scraper-with-youtube.ts`, puedes cambiar el modelo:

```typescript
model: 'gpt-3.5-turbo',  // o 'gpt-4', 'gpt-4o', etc.
```

## 🐛 Solución de Problemas

### No aparecen videos

1. Verifica que ejecutaste `npm run scrape` primero
2. Revisa que existe el archivo `public/playlist.json`
3. Verifica tu conexión a internet

### Error de cuota de OpenAI

Verifica que tienes créditos disponibles en: https://platform.openai.com/account/billing

### El servidor no inicia

1. Verifica que el puerto 3000 está libre
2. Intenta cambiar el puerto en `server.ts`

## 🔄 Actualizar Playlist

Para obtener las canciones más recientes de Billboard:

```bash
npm run scrape
```

Luego recarga la página en tu navegador.

## 🌟 Mejoras Futuras

- [ ] Agregar más canciones (Top 10, Top 20, etc.)
- [ ] Soporte para otras categorías (Rock, Pop, etc.)
- [ ] Modo aleatorio (shuffle)
- [ ] Guardar favoritos
- [ ] Compartir playlist

## 📄 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Siéntete libre de abrir un issue o pull request.

---

**Desarrollado con ❤️ usando Playwright, OpenAI, YouTube API y Express**
