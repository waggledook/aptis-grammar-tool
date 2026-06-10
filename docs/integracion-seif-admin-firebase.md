# Integración de SEIF Admin con Firebase para SeifHub

Esta nota es para el desarrollador que mantiene la aplicación de administración de SEIF. El objetivo es que esa aplicación pueda crear y renovar automáticamente el acceso de los alumnos a SeifHub cuando se registre un alumno nuevo o cuando cambie su contrato.

## Proyecto Actual de Firebase

- ID del proyecto Firebase: `examplay-auth`
- Dominio de Auth: `examplay-auth.firebaseapp.com`
- Región de Cloud Functions utilizada por esta app: `europe-west1`
- URL de SeifHub: `https://seifhub.beeskillsenglish.com`
- Ruta alternativa local: `/?site=seifhub`

La configuración pública web de Firebase está en `src/firebase.js`, pero el alta automática de alumnos no debería hacerse desde código del navegador en la app externa de administración. Lo recomendable es hacerlo servidor-a-servidor, mediante una Cloud Function HTTPS específica en este proyecto de Firebase o mediante un servicio backend con credenciales controladas de Firebase Admin.

## Modelo de Usuario que Necesita SeifHub

El acceso a SeifHub se controla con el usuario de Firebase Auth y el documento correspondiente en Firestore:

```text
Usuario de Firebase Auth
  uid
  email
  password
  displayName

Documento de Firestore
  /users/{uid}
```

Documento mínimo en Firestore:

```json
{
  "email": "student@example.com",
  "name": "Student Name",
  "username": "",
  "role": "student",
  "createdAt": "<server timestamp>",
  "updatedAt": "<server timestamp>",
  "siteAccess": {
    "seifhub": {
      "active": true,
      "startDate": "2026-06-09",
      "endDate": "2026-09-07",
      "indefinite": false
    }
  },
  "externalSystems": {
    "seifAdmin": {
      "studentId": "12345",
      "contractId": "abc-123",
      "contractEndDate": "2026-08-31",
      "lastSyncedAt": "<server timestamp>"
    }
  }
}
```

`siteAccess.seifhub` es el campo clave:

- `active: true` activa el acceso a SeifHub.
- `startDate` y `endDate` son fechas ISO: `YYYY-MM-DD`.
- La app permite el acceso mientras la fecha actual esté entre `startDate` y `endDate`, ambas incluidas.
- `indefinite: false` significa que `endDate` se aplica.
- Para la regla propuesta, `endDate` debe ser `contractEndDate + 7 days`.

La lógica de acceso está en `src/siteConfig.js`.

## Flujo de Alta

Cuando se registre un alumno nuevo en la app de administración de SEIF:

1. Normalizar el email de registro: minúsculas y sin espacios al principio o al final.
2. Calcular `seifhubEndDate = contractEndDate + 7 days`.
3. Crear o actualizar un usuario de Firebase Auth con:
   - `email`: el email usado en el registro
   - `password`: `12345678`
   - `displayName`: nombre + apellidos
4. Crear o combinar `/users/{uid}` con:
   - `role: "student"`
   - `email`
   - `name`
   - `siteAccess.seifhub.active: true`
   - `siteAccess.seifhub.startDate`
   - `siteAccess.seifhub.endDate`
   - `siteAccess.seifhub.indefinite: false`
   - identificadores externos de la app de administración, si están disponibles

Importante: Firebase Auth exige que los emails sean únicos. Si el email ya existe, la integración debería actualizar el acceso del usuario existente en Firestore, no crear una cuenta duplicada.

## Flujo de Renovación

Cuando un alumno renueve:

1. Encontrar el usuario de Firebase Auth por email o por el valor guardado en `externalSystems.seifAdmin.studentId`.
2. Calcular el nuevo `seifhubEndDate = newContractEndDate + 7 days`.
3. Actualizar solo los campos de acceso en Firestore y los metadatos externos del contrato.

Actualización recomendada para una renovación:

```json
{
  "siteAccess.seifhub": {
    "active": true,
    "startDate": "2026-06-09",
    "endDate": "2026-12-22",
    "indefinite": false
  },
  "externalSystems.seifAdmin.contractEndDate": "2026-12-15",
  "externalSystems.seifAdmin.lastSyncedAt": "<server timestamp>",
  "updatedAt": "<server timestamp>"
}
```

## Flujo de Cancelación o No Renovación

Si la app de administración cancela el acceso explícitamente:

```json
{
  "siteAccess.seifhub": {
    "active": false,
    "startDate": "",
    "endDate": "",
    "indefinite": false
  },
  "updatedAt": "<server timestamp>"
}
```

Si el alumno simplemente no renueva, no hace falta desactivarlo manualmente siempre que `endDate` esté rellenado. SeifHub dejará de permitir el acceso después de esa fecha.

## Límite Recomendado de la API

La mejor opción sería añadir una Cloud Function HTTPS a este proyecto Firebase, por ejemplo:

```text
POST https://europe-west1-examplay-auth.cloudfunctions.net/syncSeifHubStudent
```

Cuerpo de petición sugerido:

```json
{
  "studentId": "12345",
  "contractId": "abc-123",
  "firstName": "Ana",
  "lastName": "Garcia",
  "email": "ana@example.com",
  "contractStartDate": "2026-06-09",
  "contractEndDate": "2026-08-31",
  "status": "active"
}
```

Respuesta sugerida:

```json
{
  "ok": true,
  "uid": "firebase-auth-uid",
  "email": "ana@example.com",
  "seifhubEndDate": "2026-09-07",
  "createdAuthUser": true
}
```

La autenticación de este endpoint debería hacerse con una cabecera secreta compartida solo entre servidores o mediante una petición servicio-a-servicio firmada por Google. El secreto no debe exponerse nunca en JavaScript del navegador.

Ejemplo de cabecera:

```text
Authorization: Bearer <server-only secret>
```

## Ejemplo de Cloud Function

Esto es un borrador para `functions/index.js`. Usa Firebase Admin, así que puede saltarse de forma segura las reglas de Firestore del cliente porque se ejecuta en un servidor de confianza.

```js
const cors = require("cors")({ origin: true });

function addDaysIso(isoDate, days) {
  const [year, month, day] = String(isoDate || "").split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

exports.syncSeifHubStudent = functions
  .region("europe-west1")
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== "POST") {
          res.status(405).json({ ok: false, error: "Use POST." });
          return;
        }

        const expectedSecret = process.env.SEIF_ADMIN_SYNC_SECRET;
        const authHeader = req.get("authorization") || "";
        const token = authHeader.replace(/^Bearer\s+/i, "");
        if (!expectedSecret || token !== expectedSecret) {
          res.status(401).json({ ok: false, error: "Unauthorised." });
          return;
        }

        const body = req.body || {};
        const email = normalizeEmail(body.email);
        const contractEndDate = String(body.contractEndDate || "").slice(0, 10);
        const contractStartDate = String(body.contractStartDate || "").slice(0, 10);

        if (!email || !email.includes("@")) {
          res.status(400).json({ ok: false, error: "A valid email is required." });
          return;
        }

        if (!contractEndDate) {
          res.status(400).json({ ok: false, error: "contractEndDate is required." });
          return;
        }

        const seifhubEndDate = addDaysIso(contractEndDate, 7);
        const displayName = [body.firstName, body.lastName].filter(Boolean).join(" ").trim();

        let authUser;
        let createdAuthUser = false;

        try {
          authUser = await admin.auth().getUserByEmail(email);
        } catch (err) {
          if (err.code !== "auth/user-not-found") throw err;
          authUser = await admin.auth().createUser({
            email,
            password: "12345678",
            displayName: displayName || undefined,
            emailVerified: false,
          });
          createdAuthUser = true;
        }

        if (displayName && authUser.displayName !== displayName) {
          await admin.auth().updateUser(authUser.uid, { displayName });
        }

        const active = body.status !== "cancelled" && body.status !== "inactive";
        const access = active
          ? {
              active: true,
              startDate: contractStartDate || new Date().toISOString().slice(0, 10),
              endDate: seifhubEndDate,
              indefinite: false,
            }
          : {
              active: false,
              startDate: "",
              endDate: "",
              indefinite: false,
            };

        const userRef = admin.firestore().doc(`users/${authUser.uid}`);
        const existingSnap = await userRef.get();
        const existingData = existingSnap.exists ? existingSnap.data() || {} : {};
        const firestorePayload = {
          email,
          name: displayName || existingData.name || "",
          username: existingData.username || "",
          role: existingData.role || "student",
          siteAccess: { seifhub: access },
          externalSystems: {
            seifAdmin: {
              studentId: body.studentId || existingData.externalSystems?.seifAdmin?.studentId || "",
              contractId: body.contractId || "",
              contractEndDate,
              lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (!existingSnap.exists) {
          firestorePayload.createdAt = admin.firestore.FieldValue.serverTimestamp();
        }

        await userRef.set(firestorePayload, { merge: true });

        res.json({
          ok: true,
          uid: authUser.uid,
          email,
          seifhubEndDate: access.endDate,
          createdAuthUser,
        });
      } catch (err) {
        console.error("syncSeifHubStudent failed", err);
        res.status(500).json({ ok: false, error: "Sync failed." });
      }
    });
  });
```

Antes de desplegar, hay que añadir el secreto como variable de entorno de Cloud Functions o como configuración de Firebase Functions. El comando exacto dependerá de cómo esté configurado el despliegue actual.

## Notas y Riesgos

- La contraseña por defecto `12345678` coincide con el funcionamiento actual de SEIF. Más adelante se podría pedir o forzar al alumno a cambiarla en el primer inicio de sesión.
- No conviene dar a la parte frontend de la app de administración acceso directo de escritura a Firestore. Las reglas actuales de Firestore restringen a propósito las actualizaciones de `siteAccess`.
- La sincronización debe ser idempotente: llamadas repetidas con el mismo email deben actualizar el usuario existente y las fechas de contrato, no crear duplicados.
- Conviene guardar `studentId` y `contractId` del sistema externo; esto hace que las renovaciones futuras sean más seguras que depender solo del email.
- Actualmente la app da acceso automático a SeifHub a usuarios con rol `teacher` o `admin`, pero los alumnos normales necesitan `siteAccess.seifhub.active`.

## Referencias de Código Relevantes

- Configuración de Firebase y helpers de Auth: `src/firebase.js`
- Control de acceso a SeifHub: `src/siteConfig.js`
- Panel de administración que edita el acceso a SeifHub: `src/components/admin/AdminDashboard.jsx`
- Reglas de Firestore que restringen `siteAccess`: `firestore.rules`
- Punto de entrada actual de Cloud Functions: `functions/index.js`
