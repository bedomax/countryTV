# 🎸 Country MTV

Una aplicación web minimalista que reproduce automáticamente los videos de las Top 5 canciones Country de Billboard en pantalla completa, al estilo MTV.

![Country MTV](https://img.shields.io/badge/Country-MTV-red)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## ✨ Características

- 🎵 **Extracción automática** de las Top 5 canciones de Billboard Hot Country Songs usando IA
- 🎬 **Búsqueda inteligente** de videos oficiales en YouTube
- 📺 **Experiencia pantalla completa** minimalista y elegante
- 🔄 **Autoplay continuo** - Los videos se reproducen automáticamente uno tras otro
- 👻 **UI que desaparece** - Los controles se ocultan después de 3 segundos de inactividad
- ⌨️ **Controles por teclado** para navegación rápida
- 📱 **Responsive** - Compatible con dispositivos móviles

## 🚀 Demo

La interfaz cuenta con:
- Video en pantalla completa (100vw x 100vh)
- Overlays sutiles con gradientes oscuros
- Logo "COUNTRY MTV" con indicador LIVE animado
- Información de la canción actual (posición, título, artista)
- Playlist lateral deslizable
- Controles minimalistas

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express + TypeScript
- **Scraping**: Playwright
- **IA**: OpenAI GPT-3.5-turbo
- **APIs**: YouTube IFrame Player API

## 📋 Requisitos

- Node.js >= 18.0.0
- npm o yarn
- API Key de OpenAI

## 🔧 Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/bedomax/countryTV.git
cd countryTV
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
OPENAI_API_KEY=tu-api-key-aqui
```

4. **Obtener playlist de videos**

```bash
npm run scrape
```

Este comando:
- Extrae las Top 5 canciones de Billboard
- Busca los videos oficiales en YouTube
- Guarda la playlist en `public/playlist.json`

5. **Iniciar el servidor**

```bash
npm run serve
```

6. **Abrir en el navegador**

```
http://localhost:3000
```

## 📝 Scripts Disponibles

```bash
# Extraer canciones y buscar videos de YouTube
npm run scrape

# Iniciar servidor web
npm run serve

# Hacer ambas cosas en secuencia
npm run dev

# Construir el proyecto
npm run build
```

## ⌨️ Controles

### Teclado
- **→** o **N**: Siguiente canción
- **←** o **B**: Canción anterior
- **Espacio**: Play/Pausa
- **P**: Abrir/Cerrar playlist
- **Escape**: Cerrar playlist

### Mouse
- **Mover el mouse**: Mostrar controles
- **Click en botones**: Navegar entre canciones
- **Click en playlist**: Seleccionar canción

## 📁 Estructura del Proyecto

```
countryTV/
├── public/                    # Frontend
│   ├── index.html            # Página principal
│   ├── style.css             # Estilos minimalistas
│   ├── app.js                # Lógica del reproductor
│   └── playlist.json         # Datos de canciones (generado)
├── scraper-with-youtube.ts   # Scraper de Billboard + YouTube
├── server.ts                 # Servidor Express
├── simple-ai-scraper.ts      # Scraper simple (alternativo)
├── index.ts                  # Scraper con Stagehand (alternativo)
├── package.json              # Dependencias
└── tsconfig.json             # Configuración TypeScript
```

## 🎨 Personalización

### Cambiar cantidad de canciones

Edita `scraper-with-youtube.ts`:

```typescript
minItems: 5,  // Cambia a 10, 20, etc.
maxItems: 5
```

### Cambiar estilos

Modifica `public/style.css` para personalizar colores y diseño.

### Cambiar modelo de IA

En `scraper-with-youtube.ts`:

```typescript
model: 'gpt-3.5-turbo',  // o 'gpt-4', 'gpt-4o', etc.
```

## 🔄 Actualizar Playlist

Para obtener las canciones más recientes:

```bash
npm run scrape
```

Luego recarga la página en tu navegador.

## 🐛 Solución de Problemas

### No aparecen videos

1. Verifica que ejecutaste `npm run scrape` primero
2. Revisa que existe `public/playlist.json`
3. Verifica tu conexión a internet

### Error de cuota de OpenAI

Verifica créditos en: https://platform.openai.com/account/billing

### Puerto en uso

Cambia el puerto en `server.ts`:

```typescript
const PORT = 3001; // o cualquier puerto disponible
```

## 🌟 Características Futuras

- [ ] Soporte para más canciones (Top 10, Top 20, etc.)
- [ ] Múltiples géneros (Rock, Pop, Hip-Hop, etc.)
- [ ] Modo aleatorio (shuffle)
- [ ] Guardar favoritos localmente
- [ ] Compartir playlist
- [ ] Sincronización con Spotify
- [ ] Modo oscuro/claro
- [ ] Estadísticas de reproducción

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto como desees.

## 🤝 Contribuciones

Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 👨‍💻 Autor

**Bedomax**

- GitHub: [@bedomax](https://github.com/bedomax)

## 🙏 Agradecimientos

- Billboard por proporcionar los charts
- YouTube por la API del reproductor
- OpenAI por la tecnología de IA
- Playwright por las herramientas de scraping

---

**Desarrollado con ❤️ usando Playwright, OpenAI, YouTube API y Express**

Si te gusta este proyecto, ¡dale una ⭐ en GitHub!
