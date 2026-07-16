# API de integración de SEIF Admin con las plataformas de SEIF

Documento técnico para la aplicación de administración de SEIF.

## Objetivo

Cuando se cree o modifique un alumno en SEIF Admin, esa aplicación enviará el estado
actual del alumno a una API de SEIF. La API creará o actualizará la cuenta de Firebase
y sincronizará su acceso a las plataformas.

La aplicación de administración no necesita acceso directo a Firebase, Firestore ni a
ninguna base de datos de las plataformas.

## Endpoint

```text
POST https://europe-west1-examplay-auth.cloudfunctions.net/syncSeifAdminStudent
Content-Type: application/json
Authorization: Bearer <TOKEN_COMPARTIDO>
```

El token es secreto y solo puede guardarse en el servidor de SEIF Admin. No debe
incluirse en JavaScript ejecutado en un navegador, repositorios públicos ni registros.

## Cuerpo de la petición

Cada petición representa el estado completo y actual del alumno:

```json
{
  "studentId": "12345",
  "contractId": "contrato-2026-12345",
  "firstName": "Ana",
  "lastName": "García",
  "email": "ana@example.com",
  "courseStartDate": "2026-09-01",
  "courseEndDate": "2027-06-30",
  "status": "active",
  "access": {
    "aptisTrainer": true,
    "ote": false
  }
}
```

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---:|---|
| `studentId` | string | Sí | Identificador permanente y único del alumno en SEIF Admin. |
| `contractId` | string | No | Identificador del contrato actual. |
| `firstName` | string | Recomendado | Nombre del alumno. |
| `lastName` | string | Recomendado | Apellidos del alumno. |
| `email` | string | Sí | Email actual. Se normaliza a minúsculas. |
| `courseStartDate` | `YYYY-MM-DD` | No | Fecha de inicio. Si se omite en un alta activa, se usa la fecha actual. |
| `courseEndDate` | `YYYY-MM-DD` | Sí con `active` o `completed` | Fecha final del curso o contrato. |
| `status` | string | Sí | `active`, `completed` o `cancelled`. |
| `access.aptisTrainer` | boolean | Sí con `active` o `completed` | Acceso solicitado a Aptis Trainer. |
| `access.ote` | boolean | Sí con `active` o `completed` | Acceso solicitado a OTE. |

No se envía un campo para SeifHub: todo alumno con `status: "active"` o
`status: "completed"` conserva acceso a SeifHub hasta la fecha calculada.

## Reglas de acceso

- `seifhub` se activa automáticamente con `active` y se conserva con `completed`.
- `aptisTrainer` se controla mediante `access.aptisTrainer`.
- `ote` se controla mediante `access.ote`.
- La fecha de caducidad es `courseEndDate + 14 días`.
- `completed` conserva los accesos seleccionados hasta esa misma fecha de caducidad.
- `cancelled` desactiva las tres plataformas inmediatamente.
- Con `active` o `completed` deben enviarse siempre los dos booleanos de `access`.
- Cambiar un booleano de `true` a `false` retira ese acceso.
- Repetir exactamente la misma petición es seguro: actualiza la misma cuenta y no
  crea duplicados.

## Altas, alumnos existentes y renovaciones

La misma llamada sirve para todas las operaciones:

### Alumno nuevo

Si no existe una cuenta asociada al `studentId` ni al email, la API:

1. crea el usuario en Firebase Auth;
2. asigna la contraseña inicial `12345678`;
3. crea el perfil de Firestore;
4. aplica los accesos solicitados;
5. guarda el `studentId` para futuras sincronizaciones.

La contraseña inicial solo se asigna al crear la cuenta. Una sincronización posterior
nunca cambia la contraseña de un usuario existente.

### Alumno existente que empieza un curso de examen

Se envía el mismo `studentId`, las fechas actuales y, por ejemplo:

```json
"access": {
  "aptisTrainer": true,
  "ote": false
}
```

La API actualiza la cuenta existente y añade Aptis Trainer, conservando SeifHub.

### Renovación

Se vuelve a enviar el estado completo con el nuevo `courseEndDate`. La API localiza al
alumno mediante `studentId`, actualiza el contrato y calcula una nueva caducidad de 14
días después de la fecha recibida.

Ejemplo: `courseEndDate: "2027-09-30"` produce
`accessEndDate: "2027-10-14"`.

### Cambio de email

El `studentId` es la identidad principal. Si el email cambia, se envía el mismo
`studentId` con el email nuevo. La API actualiza Firebase Auth y Firestore. Si el email
nuevo ya pertenece a otra cuenta, devuelve un conflicto y no combina las cuentas.

### Finalización normal del curso

Cuando un alumno termine y sea desactivado de forma ordinaria en SEIF Admin, se envía
`status: "completed"` junto con las fechas y los accesos que tenía:

```json
{
  "studentId": "12345",
  "email": "ana@example.com",
  "courseStartDate": "2026-09-01",
  "courseEndDate": "2027-06-30",
  "status": "completed",
  "access": {
    "aptisTrainer": true,
    "ote": false
  }
}
```

Aunque el estado administrativo sea `completed`, los accesos seleccionados siguen
activos hasta `courseEndDate + 14 días`. Después, las plataformas rechazan el acceso
automáticamente por fecha.

### Cancelación inmediata

```json
{
  "studentId": "12345",
  "email": "ana@example.com",
  "status": "cancelled"
}
```

`cancelled` se reserva para bajas que deben cortar el acceso inmediatamente, por
ejemplo una cancelación anticipada, impago, error o incidencia. Desactiva SeifHub,
Aptis Trainer y OTE, pero no elimina la cuenta ni cambia su contraseña.

## Respuesta correcta

Un alta nueva devuelve HTTP `201`; una actualización devuelve HTTP `200`:

```json
{
  "ok": true,
  "uid": "firebase-auth-uid",
  "studentId": "12345",
  "email": "ana@example.com",
  "createdAuthUser": false,
  "status": "active",
  "accessEndDate": "2027-07-14",
  "access": {
    "seifhub": true,
    "aptisTrainer": true,
    "ote": false
  }
}
```

## Errores

Los errores usan esta estructura:

```json
{
  "ok": false,
  "error": {
    "code": "invalid_request",
    "message": "courseEndDate must use YYYY-MM-DD format."
  }
}
```

| HTTP | Significado |
|---:|---|
| `400` | Faltan datos o algún valor/formato no es válido. |
| `401` | Token ausente o incorrecto. |
| `405` | Debe utilizarse `POST`. |
| `409` | El `studentId` o email entra en conflicto con otra cuenta. Requiere revisión. |
| `500` | Error interno temporal. Se puede reintentar más tarde. |

SEIF Admin debe registrar el código HTTP y el `error.code`, y mostrar o poner en cola
los fallos para que una sincronización no se pierda silenciosamente. Puede reintentar
errores `500`; no debe reintentar automáticamente errores `400`, `401` o `409` sin
corregir primero la causa.

## Ejemplo con curl

```bash
curl --request POST \
  'https://europe-west1-examplay-auth.cloudfunctions.net/syncSeifAdminStudent' \
  --header 'Authorization: Bearer <TOKEN_COMPARTIDO>' \
  --header 'Content-Type: application/json' \
  --data '{
    "studentId": "12345",
    "contractId": "contrato-2026-12345",
    "firstName": "Ana",
    "lastName": "García",
    "email": "ana@example.com",
    "courseStartDate": "2026-09-01",
    "courseEndDate": "2027-06-30",
    "status": "active",
    "access": {
      "aptisTrainer": true,
      "ote": false
    }
  }'
```

## Configuración y despliegue por parte de SEIF

Antes del primer despliegue se debe crear el secreto de Firebase:

```bash
firebase functions:secrets:set SEIF_ADMIN_SYNC_SECRET
```

Después se despliega únicamente esta función:

```bash
firebase deploy --only functions:syncSeifAdminStudent
```

El valor del secreto se entregará al responsable de SEIF Admin por un canal seguro,
separado de este documento.

## Implementación en este repositorio

- Endpoint: `functions/index.js`, export `syncSeifAdminStudent`.
- Proyecto Firebase: `examplay-auth`.
- Región: `europe-west1`.
- Control de acceso del frontend: `src/siteConfig.js`.
- Notificación por cambios de acceso: función `emailSiteAccessGranted`.
- Reglas de protección de perfiles: `firestore.rules`.
