/* eslint-disable */
import * as registry from '../registry.js'
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Permission_System_BodyInputs */

const en_demo_narrative_deepdive_permission_system_body = /** @type {(inputs: Demo_Narrative_Deepdive_Permission_System_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Every organization divides work differently, so CARE-Y ships three roles with sensible defaults and lets the organization move almost every individual ability between them. The three roles are Volunteer, Manager and Admin. What each one can actually do is a set of keys, and an administrator can hand a key to a role that did not have it or take one away from a role that did. [[#permissions]]
The keys are grouped by the kind of work they govern rather than by seniority. [[#permissions]]
- Keys for the case record cover viewing cases, writing notes, changing status, linking and claiming, and downloading media. [[#permissions #client-data]]
- Keys for reaching a client are split by channel so an organization can staff texting and calling differently, with one key for sending files that applies across every channel. [[#permissions #telephony]]
- Keys for the client's own access to their case cover share links, portal channels, login resets and revoking reply links. [[#permissions #portal]]
- Keys for client records cover viewing clients, viewing their personal information, editing contact details and aliases, and merging. [[#permissions #client-data]]
- Keys for the knowledge base cover reading, writing, managing categories and deleting articles. [[#permissions]]
- Keys for queues separate queue management, queue membership and queue notifications. [[#permissions]]
- Keys for intake separate designing forms from viewing submitted responses. [[#permissions]]
- Keys for running the organization cover roles, users, identity, channel routing, retention, note types, encryption keys, infrastructure, greetings, automatic replies, voicemail quarantine, escalation, presets, reports and the audit log. [[#permissions]]
Defaults are chosen so that turning the system on changes nobody's day. Each key sits at the level that gated the same operation before the keys existed, which is why the four client-contact keys start at Volunteer level even though an organization might prefer otherwise. Reaching a client used to require only a session, so starting those keys anywhere higher would have meant a fresh install where nobody can answer anyone. An organization that wants a back-office role withholds those keys deliberately. [[#permissions]]
Managing encryption keys, managing roles, and managing infrastructure stay with Admin whatever anyone configures, so that no role can ever grant itself permissions. That lock is enforced when an override is written and again when permissions are read, so a row inserted directly into the database granting one of the three to another role has no effect. [[#permissions #failure-states]]
Permissions govern actions, not visibility of already-released material. Someone holding the intake responses key receives an encrypted copy of each submission at the moment it arrives, so taking the key away stops future copies and does not unwrap the ones already issued. And a few keys are declared for operations that do not exist yet, so seeing "Delete clients" or "View own shifts" in the list does not mean a feature is behind it. [[#permissions #failure-states #encryption]]
**How an effective set is computed.** Each role has a default set in server-side configuration, and per-organization overrides live in \`role_permission_overrides\`, one sparse row per role and permission with an enabled flag. Setting a permission back to its default deletes the row rather than storing it. The merge then runs in four steps. [[#permissions #server-holds]]
1. Start from the role's default set. [[#permissions]]
2. Apply each override row as an add or a remove. [[#permissions]]
3. Ignore override rows naming an unknown permission, so removed or future names do not break the merge. [[#permissions]]
4. Enforce the locks by force-adding all three locked keys to Admin and force-removing them from every other role. [[#permissions #failure-states]]
Role ids in the database are deliberately opaque strings rather than readable names, so a database-only attacker cannot infer the organization's structure from them, and the human-readable name lives server-side until encrypted admin configuration carries it. [[#permissions #server-holds]]
**Caching and its deployment constraint.** Effective sets are cached per organization in process memory, filled for all three roles in one query on a miss, and invalidated by every override mutation so a revoked permission stops working on the next request rather than after a timeout. That cache is process-local, which means a multi-instance deployment would let one instance keep serving a revoked set after another instance invalidated its own copy. The server refuses to boot with multiple instances enabled for exactly that reason, and a shared-store cache is the prerequisite for lifting the restriction. [[#permissions #failure-states]]
**Queue membership is a separate grant.** Membership in a queue grants read access to every case in that queue, and it is governed by its own key rather than riding on queue management or on notification routing. Keeping those three apart is what keeps the access grant visible as a grant. Notification routing determines who gets pinged and grants no access on its own. [[#permissions #trust-boundary]]
**Contributor pointers.** The names, the enforcement and the surfaces sit in four places. [[#permissions]]
- \`packages/shared/src/roles.ts\` holds the \`Permission\` enum and its grouping, and it is append-only after deployment because renaming a member orphans every override row that names it. [[#permissions]]
- \`packages/server/src/auth/roles.ts\` holds role defaults, the lock set, the merge function, the cache, the override repository and the permission-holder queries that intake and notification targeting use, with request-time gating in \`role-middleware.ts\`. [[#permissions]]
- \`packages/server/src/db/migrations/tenant/086_create_role_permission_overrides.ts\` defines the override table. [[#permissions #server-holds]]
- \`packages/client/src/lib/components/admin/RolePermissionsSection.svelte\` is the administrative surface, and \`packages/client/src/lib/shell/section-registry.ts\` maps sections to permissions for client-side gating. [[#permissions]]`)
};

const es_demo_narrative_deepdive_permission_system_body = /** @type {(inputs: Demo_Narrative_Deepdive_Permission_System_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada organización reparte el trabajo de forma distinta, así que CARE-Y viene con tres roles con valores predeterminados sensatos y deja que la organización mueva casi cualquier capacidad individual entre ellos. Los tres roles son Voluntario, Gestor y Administrador. Lo que cada uno puede hacer realmente es un conjunto de llaves, y una persona administradora puede entregar una llave a un rol que no la tenía o quitarla a un rol que sí. [[#permissions]]
Las llaves se agrupan por el tipo de trabajo que gobiernan y no por antigüedad. [[#permissions]]
- Las llaves del expediente del caso cubren ver casos, escribir notas, cambiar el estado, vincular y reclamar, y descargar archivos multimedia. [[#permissions #client-data]]
- Las llaves para contactar a un cliente están divididas por canal para que una organización pueda dotar de personal los mensajes de texto y las llamadas de forma distinta, con una sola llave para enviar archivos que se aplica a todos los canales. [[#permissions #telephony]]
- Las llaves del acceso del cliente a su propio caso cubren los enlaces de compartición, los canales del portal, los restablecimientos de inicio de sesión y la revocación de enlaces de respuesta. [[#permissions #portal]]
- Las llaves de los registros de clientes cubren ver clientes, ver sus datos personales, editar datos de contacto y alias, y fusionar. [[#permissions #client-data]]
- Las llaves de la base de conocimiento cubren leer, escribir, gestionar categorías y eliminar artículos. [[#permissions]]
- Las llaves de las colas separan la gestión de colas, la membresía de colas y las notificaciones de colas. [[#permissions]]
- Las llaves de ingreso separan el diseño de formularios de la consulta de las respuestas enviadas. [[#permissions]]
- Las llaves para administrar la organización cubren los roles, las personas usuarias, la identidad, el enrutamiento de canales, la retención, los tipos de nota, las claves de cifrado, la infraestructura, los saludos, las respuestas automáticas, la cuarentena de correos de voz, la escalada, los ajustes preestablecidos, los reportes y el registro de auditoría. [[#permissions]]
Los valores predeterminados están elegidos para que encender el sistema no cambie el día a nadie. Cada llave queda en el nivel que controlaba esa misma operación antes de que existieran las llaves, y por eso las cuatro llaves de contacto con el cliente empiezan en el nivel de Voluntario aunque una organización pudiera preferir otra cosa. Contactar a un cliente antes solo requería una sesión, así que empezar esas llaves en cualquier nivel más alto habría significado una instalación nueva donde nadie puede responder a nadie. Una organización que quiere un rol de trastienda retiene esas llaves deliberadamente. [[#permissions]]
Cuidar las claves de cifrado, gestionar roles y gestionar infraestructura se quedan con Administrador por más que alguien configure otra cosa, para que ningún rol pueda concederse permisos a sí mismo. Ese bloqueo se aplica cuando se escribe una excepción y otra vez cuando se leen los permisos, así que una fila insertada directamente en la base de datos que conceda una de las tres a otro rol no tiene efecto. [[#permissions #failure-states]]
Los permisos gobiernan acciones, no la visibilidad del material ya entregado. Quien tiene la llave de las respuestas de ingreso recibe una copia cifrada de cada envío en el momento en que llega, así que quitarle la llave detiene las copias futuras y no desenvuelve las ya emitidas. Y unas pocas llaves están declaradas para operaciones que aún no existen, así que ver "Eliminar clientes" o "Ver mis turnos" en la lista no significa que haya una función detrás. [[#permissions #failure-states #encryption]]
**Cómo se calcula un conjunto efectivo.** Cada rol tiene un conjunto predeterminado en la configuración del lado del servidor, y las excepciones por organización viven en \`role_permission_overrides\`, una fila dispersa por rol y permiso con una marca de activación. Devolver un permiso a su valor predeterminado elimina la fila en lugar de almacenarla. La combinación corre entonces en cuatro pasos. [[#permissions #server-holds]]
1. Se parte del conjunto predeterminado del rol. [[#permissions]]
2. Se aplica cada fila de excepción como una adición o una retirada. [[#permissions]]
3. Se ignoran las filas de excepción que nombran un permiso desconocido, para que los nombres retirados o futuros no rompan la combinación. [[#permissions]]
4. Se imponen los bloqueos añadiendo por fuerza las tres llaves bloqueadas a Administrador y retirándolas por fuerza de todos los demás roles. [[#permissions #failure-states]]
Los identificadores de rol en la base de datos son cadenas opacas a propósito y no nombres legibles, para que un atacante que solo tenga la base de datos no pueda inferir de ellos la estructura de la organización, y el nombre legible vive en el servidor hasta que la configuración de administración cifrada lo lleve. [[#permissions #server-holds]]
**La caché y su restricción de despliegue.** Los conjuntos efectivos se guardan en caché por organización en la memoria del proceso, se rellenan para los tres roles en una sola consulta cuando fallan, y se invalidan con cada mutación de excepciones para que un permiso revocado deje de funcionar en la siguiente solicitud y no tras un tiempo de espera. Esa caché es local al proceso, lo que significa que un despliegue con varias instancias dejaría que una instancia siguiera sirviendo un conjunto revocado después de que otra instancia invalidara su propia copia. El servidor se niega a arrancar con varias instancias habilitadas precisamente por eso, y una caché en un almacén compartido es el requisito previo para levantar la restricción. [[#permissions #failure-states]]
**La membresía de cola es una concesión aparte.** La membresía en una cola concede acceso de lectura a todos los casos de esa cola, y está gobernada por su propia llave en lugar de ir montada sobre la gestión de colas o sobre el enrutamiento de notificaciones. Mantener esas tres cosas separadas es lo que mantiene la concesión de acceso visible como una concesión. El enrutamiento de notificaciones determina a quién se avisa y no concede ningún acceso por sí mismo. [[#permissions #trust-boundary]]
**Indicaciones para quien contribuye.** Los nombres, la aplicación de las reglas y las superficies están en cuatro lugares. [[#permissions]]
- \`packages/shared/src/roles.ts\` contiene la enumeración \`Permission\` y su agrupación, y es de solo añadir después del despliegue porque renombrar un miembro deja huérfana toda fila de excepción que lo nombre. [[#permissions]]
- \`packages/server/src/auth/roles.ts\` contiene los valores predeterminados de los roles, el conjunto bloqueado, la función de combinación, la caché, el repositorio de excepciones y las consultas de quién tiene un permiso que usan el ingreso y la selección de destinatarios de notificaciones, con la comprobación en tiempo de solicitud en \`role-middleware.ts\`. [[#permissions]]
- \`packages/server/src/db/migrations/tenant/086_create_role_permission_overrides.ts\` define la tabla de excepciones. [[#permissions #server-holds]]
- \`packages/client/src/lib/components/admin/RolePermissionsSection.svelte\` es la superficie de administración, y \`packages/client/src/lib/shell/section-registry.ts\` asigna secciones a permisos para la comprobación del lado del cliente. [[#permissions]]`)
};

/**
* | output |
* | --- |
* | "Every organization divides work differently, so CARE-Y ships three roles with sensible defaults and lets the organization move almost every individual abilit..." |
*
* @param {Demo_Narrative_Deepdive_Permission_System_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_permission_system_body = /** @type {((inputs?: Demo_Narrative_Deepdive_Permission_System_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Permission_System_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_permission_system_body(inputs)
	return en_demo_narrative_deepdive_permission_system_body(inputs)
});