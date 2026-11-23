# Frontend Mobile - AI Ticket IT (React Native)

Aplicación móvil desarrollada en **React Native** con TypeScript para la plataforma de venta de entradas **AI Ticket It**.

---

## 🎨 Identidad Visual y Diseño
- **Paleta de Colores:** Verde Esmeralda (`#10B981`) y Menta (`#ECFDF5`), inspirada en el logo del trabajo práctico ("AI Ticket It - Entradas a un click"), combinada con fondos limpios en blanco y Slate (`#0F172A`).
- **Arquitectura de Componentes:** Componentes nativos y modulares de React Native (`View`, `Text`, `TouchableOpacity`, `ScrollView`, `FlatList`, `Modal`), sin dependencias pesadas de librerías nativas para asegurar portabilidad inmediata en cualquier dispositivo.

---

## 📱 Pantallas y Flujos Funcionales (Casos de Uso del PDF)

| Pantalla | Componente / Archivo | Funcionalidades / Casos de Uso del PDF |
| :--- | :--- | :--- |
| **Explorar Espectáculos** | `src/screens/ExploreScreen.tsx` | - Búsqueda en tiempo real por texto (CU 3).<br>- Filtrado por categorías (Música, Teatro, Deportes) (CU 3).<br>- **Ordenamiento múltiple por Precio, Fecha y Reputación del organizador** (CU 11).<br>- Marcar/desmarcar favoritos en un click (❤️). |
| **Detalle del Evento & Checkout** | `src/screens/EventDetailScreen.tsx` | - Galería de imágenes y descripción del show.<br>- Selector de tipo de entrada (General, Platea, VIP con precio y cupo) (CU 12).<br>- Selector de cantidad sin superar cupo disponible (CU 12).<br>- Cálculo del total en tiempo real y confirmación de compra.<br>- Reputación del organizador y enlace directo a sus opiniones previas (CU 10). |
| **Mis Tickets / Compras** | `src/screens/MyPurchasesScreen.tsx` | - Visualización de entradas con código de ticket (CU 1).<br>- **Contador de días restantes para eventos confirmados** ("Faltan 14 días", "¡Es hoy!") (CU 1).<br>- **Cancelar compra y reembolso inmediato** restituyendo cupos (CU 7, 8).<br>- Validación de ingreso ("Usar entrada") (CU 9).<br>- Acceso al chat y a calificar. |
| **Chat de la Compra** | `src/screens/ChatScreen.tsx` | - Comunicación bidireccional entre comprador y organizador dentro de la misma compra (CU 5 y 6).<br>- Historial cronológico de consultas. |
| **Calificar Experiencia** | `src/screens/ReviewModal.tsx` | - Calificación con estrellas (1 a 5) y comentario escrito (CU 9).<br>- Habilitado exclusivamente tras haber utilizado la entrada. |
| **Reputación del Organizador** | `src/screens/OrganizerReviewsScreen.tsx` | - Visualización de reseñas de eventos anteriores del organizador para conocer experiencias previas antes de comprar (CU 10).<br>- Promedio general de satisfacción. |
| **Eventos Favoritos** | `src/screens/FavoritesScreen.tsx` | - Acceso directo a los eventos guardados por el comprador ("guardar eventos favoritos"). |
| **Panel del Organizador** | `src/screens/OrganizerDashboardScreen.tsx` | - **Publicar nuevo evento** con múltiples tipos de entrada, precios y cupos (CU 4).<br>- **Estado de ventas en vivo:** entradas vendidas vs disponibles por cada tipo y compras agrupadas por estado (CU 2).<br>- Botón para reiniciar datos de prueba (`Reset Demo`). |

---

## 🛠️ Cómo Ejecutar la Aplicación

### 1. Iniciar el Backend Primero
En una terminal en la carpeta `backend/`:
```bash
cd backend
npm start
```
El backend iniciará en `http://localhost:3001` y precargará los datos de prueba (`seedInitialData`).

### 2. Instalar Dependencias en el Frontend
En otra terminal en la carpeta `frontend/`:
```bash
cd frontend
npm install
```

### 3. Ejecutar la App Mobile
- **Para Android:**
  ```bash
  npm run android
  ```
- **Con Expo (si utilizas Expo en tu dispositivo):**
  ```bash
  npx expo start
  ```
- **Iniciar Metro Bundler:**
  ```bash
  npm start
  ```

---

## 🌐 Configuración de Conexión con el Backend

La app cuenta con un modal de configuración de IP accesible tocando el indicador de estado en la cabecera:
- **Emulador Android Studio:** Utiliza `http://10.0.2.2:3001/api`
- **Simulador iOS:** Utiliza `http://localhost:3001/api`
- **Celular físico (Expo Go o APK):** Utiliza `http://<TU_IP_LOCAL>:3001/api` (ej. `http://192.168.1.50:3001/api`)

---

## 🎥 Consejos para el Video de Entrega (Página 9 del PDF)

El trabajo pide un video de **5 a 10 minutos** explicando la arquitectura y mostrando un flujo completo de punta a punta:
1. **Flujo recomendado:**
   - **Paso 1:** Iniciar como **Comprador** en el catálogo, buscar un evento (ej. "Cosquín"), filtrar por categoría y ordenar por precio.
   - **Paso 2:** Ingresar al evento, mostrar las estrellas del organizador y ver sus reseñas previas.
   - **Paso 3:** Seleccionar tipo de entrada y cantidad, y presionar "Comprar Entradas".
   - **Paso 4:** Ir a "Mis Tickets", mostrar el ticket con el badge de **días restantes** y abrir el **Chat** enviando una pregunta.
   - **Paso 5:** Cambiar el rol arriba a **Organizador**, responder el mensaje desde el chat o ver el reporte de ventas en el panel.
   - **Paso 6:** Volver a Comprador, marcar la entrada como "Utilizada" y dejar una reseña de 5 estrellas con comentario.
