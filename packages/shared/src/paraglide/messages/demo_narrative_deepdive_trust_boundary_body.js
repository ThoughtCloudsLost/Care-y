/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Trust_Boundary_BodyInputs */

const en_demo_narrative_deepdive_trust_boundary_body = /** @type {(inputs: Demo_Narrative_Deepdive_Trust_Boundary_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The trust boundary is the line between what the server can read and what only a browser can read, and knowing where it sits is how an organization decides whether CARE-Y is safe enough for the people it serves. [[#trust-boundary #encryption]]
The browser side of the line holds the content that identifies or quotes anyone. [[#trust-boundary #encryption #client-data]]
- A client's alias, which is the name the organization records for them. [[#trust-boundary #client-data]]
- Messages, case notes, and the files attached to a case. [[#trust-boundary #client-data]]
- Queue names, library articles and note types. [[#trust-boundary #encryption]]
- An intake form's questions and the answers a client submitted. [[#trust-boundary #client-data]]
The server side of the line holds the facts the server needs to do its job without a person present. [[#trust-boundary #server-holds #metadata]]
- It knows a case exists, when it was created, which queue it belongs to, what status and priority it carries, and which account is assigned to it. [[#trust-boundary #server-holds]]
- It knows how many messages a case has and when each arrived. [[#trust-boundary #metadata]]
- It knows which accounts exist, when they signed in, and which second-factor methods they enrolled. [[#trust-boundary #metadata]]
- It knows the credentials for the phone system and the mail server, because it has to use them. [[#trust-boundary #server-holds]]
- It has access to a client's phone number and email address, because it is what dials the number and addresses the mail, and those two columns are sealed under the server's own operational key rather than under the organization's. [[#trust-boundary #server-holds #client-data]]
Metadata is the cost of that arrangement, and activity patterns are visible in it. A dump shows when the organization is busy, which queues carry the most work, how long cases stay open, how often a particular account is active, and when someone signed in. Relationship structure is visible too, because the assignment column names a real account and there is one read-marker row per account per case they opened. None of that identifies a client, and all of it describes the organization to anyone holding the database. An organization whose threat model includes an adversary interested in staffing patterns rather than case contents should weigh this exposure before adopting the system. [[#metadata #privacy #trust-boundary]]
Two things sit outside the encryption boundary entirely by design. [[#trust-boundary #privacy]]
- Intake page branding is public, so a client can recognize who they are contacting. [[#trust-boundary #privacy]]
- Notification email addresses for users who opt into email notifications are readable by the server, because the server is what addresses the message, which is why in-app and push notifications exist for users who would rather decline. [[#trust-boundary #privacy]]
Third parties hold their own copies of some things, and CARE-Y cannot encrypt what it never touched first. A text message existed in the carrier's network and at the telephony provider before it reached CARE-Y. An email existed in the sender's own mail system. [The telephony relay](#deep-dive/the-telephony-relay) covers what CARE-Y does about that, and [The portal channel lifecycle](#deep-dive/portal-channel-lifecycle) covers the channels that avoid third parties altogether. [[#telephony #portal #trust-boundary]]
**Plaintext columns, named.** Four tables carry the bulk of the plaintext metadata. [[#server-holds #metadata #client-data]]
- On \`tickets\`, the plaintext columns are \`id\`, \`client_id\`, \`queue_id\`, \`status\`, \`priority\`, \`on_hold\`, \`assigned_to\`, \`key_generation\` and \`created_at\`, while \`encrypted_title\` and \`encrypted_description\` are bytea. [[#server-holds #client-data]]
- On \`clients\`, \`encrypted_alias\` is bytea under the organization key with an \`alias_hash\` blind index beside it, \`communication_tier\` is plaintext and names which channel tier the client is on, and the phone reference is a foreign key to \`phones\`, where \`encrypted_number\` is bytea under the server's operational key beside a \`phone_hash\` blind index. [[#server-holds #client-data]]
- On \`portal_channels\`, the channel id, auth hash, client public key, passphrase flag, status and activity timestamps are plaintext while every message body is ciphertext. [[#server-holds #portal]]
- On \`ticket_read_cursors\`, the case id and user id are the plaintext primary key with only the cursor value encrypted, so the row's existence discloses that the account opened that case while the position stays unreadable. [[#server-holds #metadata]]
Row counts, foreign key relationships and timestamp sequences are readable structurally throughout, which is what makes the activity inference above possible. Narrowing the case list is a SQL query the server runs over those same plaintext columns, so the queue, status, priority, hold state and assignment someone filtered to are visible to it, while a saved filter's name and stored state are sealed to the organization key and are not. [[#metadata #server-holds]]
**Audit and operational records.** The audit log is pseudonymous and largely plaintext by design, holding an event type, an actor id, an optional case id and a JSON metadata object, so an administrator's browser can query it without a decryption pass. It carries no case content, no phone numbers and no client aliases. Rate-limit counters, job queue rows, session tokens and the key-evaluation audit log are operational-tier data the server reads directly, while the IP address and user agent recorded on a session are sealed to the organization key and are not. [[#server-holds #metadata #privacy]]
**Where enforcement lives.** Every access decision is server-authoritative, and the client hiding a control is convenience only. [[#permissions #trust-boundary]]
- Case access runs through \`packages/server/src/tickets/access.ts\`. [[#permissions #trust-boundary]]
- Permission gates run through \`packages/server/src/auth/roles.ts\` and \`role-middleware.ts\`. [[#permissions]]
- Per-channel policy runs through service-layer assertions at every relay handler and tRPC procedure. [[#permissions #telephony]]
- Organization isolation runs through Kysely schema scoping in \`packages/server/src/db/\`. [[#permissions #server-holds]]
A contributor adding a query decides which side of the boundary its filter runs on, and a filter the server evaluates is a filter the server can read. [[#permissions #trust-boundary]]`)
};

const es_demo_narrative_deepdive_trust_boundary_body = /** @type {(inputs: Demo_Narrative_Deepdive_Trust_Boundary_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La frontera de confianza es la línea entre lo que el servidor puede leer y lo que solo un navegador puede leer, y saber dónde está es como una organización decide si CARE-Y es lo bastante seguro para las personas a las que sirve. [[#trust-boundary #encryption]]
El lado del navegador de la línea guarda el contenido que identifica o cita a alguien. [[#trust-boundary #encryption #client-data]]
- El alias de un cliente, que es el nombre con el que la organización lo registra. [[#trust-boundary #client-data]]
- Los mensajes, las notas de caso y los archivos adjuntos a un caso. [[#trust-boundary #client-data]]
- Los nombres de cola, los artículos de la biblioteca y los tipos de nota. [[#trust-boundary #encryption]]
- Las preguntas de un formulario de ingreso y las respuestas que un cliente envió. [[#trust-boundary #client-data]]
El lado del servidor de la línea guarda los hechos que el servidor necesita para hacer su trabajo sin una persona presente. [[#trust-boundary #server-holds #metadata]]
- Sabe que un caso existe, cuándo se creó, a qué cola pertenece, qué estado y prioridad lleva y qué cuenta está asignada a él. [[#trust-boundary #server-holds]]
- Sabe cuántos mensajes tiene un caso y cuándo llegó cada uno. [[#trust-boundary #metadata]]
- Sabe qué cuentas existen, cuándo iniciaron sesión y qué métodos de segundo factor registraron. [[#trust-boundary #metadata]]
- Conoce las credenciales del sistema telefónico y del servidor de correo, porque tiene que usarlas. [[#trust-boundary #server-holds]]
- Tiene acceso al número de teléfono y a la dirección de correo de un cliente, porque es lo que marca el número y dirige el correo, y esas dos columnas van selladas bajo la clave operativa del propio servidor y no bajo la de la organización. [[#trust-boundary #server-holds #client-data]]
Los metadatos son el precio de ese arreglo, y los patrones de actividad se ven en ellos. Un volcado muestra cuándo la organización tiene mucho trabajo, qué colas cargan con más, cuánto tiempo siguen abiertos los casos, con qué frecuencia está activa una cuenta concreta y cuándo inició sesión alguien. La estructura de las relaciones también se ve, porque la columna de asignación nombra una cuenta real y hay una fila de marca de lectura por cuenta y por caso que abrió. Nada de eso identifica a un cliente, y todo ello describe a la organización ante cualquiera que tenga la base de datos. Una organización cuyo modelo de amenaza incluye un adversario interesado en los patrones de personal más que en el contenido de los casos debería pesar esta exposición antes de adoptar el sistema. [[#metadata #privacy #trust-boundary]]
Dos cosas quedan por completo fuera de la frontera de cifrado por diseño. [[#trust-boundary #privacy]]
- La identidad visual de la página de ingreso es pública, para que un cliente pueda reconocer con quién está contactando. [[#trust-boundary #privacy]]
- Las direcciones de correo de notificación de las personas usuarias que eligen recibir avisos por correo son legibles por el servidor, porque el servidor es lo que dirige el mensaje, y por eso existen las notificaciones dentro de la aplicación y las notificaciones push para quienes prefieran declinar. [[#trust-boundary #privacy]]
Terceras partes tienen sus propias copias de algunas cosas, y CARE-Y no puede cifrar lo que nunca tocó primero. Un mensaje de texto existió en la red de la compañía telefónica y en el proveedor de telefonía antes de llegar a CARE-Y. Un correo existió en el propio sistema de correo de quien lo envió. [El relay de telefonía](#deep-dive/the-telephony-relay) explica qué hace CARE-Y al respecto, y [El ciclo de vida del canal del portal](#deep-dive/portal-channel-lifecycle) trata los canales que evitan a terceras partes por completo. [[#telephony #portal #trust-boundary]]
**Columnas en texto plano, nombradas.** Cuatro tablas llevan el grueso de los metadatos en texto plano. [[#server-holds #metadata #client-data]]
- En \`tickets\`, las columnas en texto plano son \`id\`, \`client_id\`, \`queue_id\`, \`status\`, \`priority\`, \`on_hold\`, \`assigned_to\`, \`key_generation\` y \`created_at\`, mientras que \`encrypted_title\` y \`encrypted_description\` son bytea. [[#server-holds #client-data]]
- En \`clients\`, \`encrypted_alias\` es bytea bajo la clave de la organización con un índice ciego \`alias_hash\` al lado, \`communication_tier\` está en texto plano y nombra en qué nivel de canal está el cliente, y la referencia al teléfono es una clave externa a \`phones\`, donde \`encrypted_number\` es bytea bajo la clave operativa del servidor junto a un índice ciego \`phone_hash\`. [[#server-holds #client-data]]
- En \`portal_channels\`, el identificador del canal, el hash de autenticación, la clave pública del cliente, la marca de frase de paso, el estado y las marcas de tiempo de actividad están en texto plano mientras que el cuerpo de cada mensaje es texto cifrado. [[#server-holds #portal]]
- En \`ticket_read_cursors\`, el identificador del caso y el de la persona usuaria son la clave primaria en texto plano y solo el valor del cursor está cifrado, así que la existencia de la fila revela que la cuenta abrió ese caso mientras la posición queda ilegible. [[#server-holds #metadata]]
El número de filas, las relaciones de claves externas y las secuencias de marcas de tiempo son legibles estructuralmente en todo el sistema, que es lo que hace posible la inferencia de actividad anterior. Acotar la lista de casos es una consulta SQL que el servidor ejecuta sobre esas mismas columnas en texto plano, así que la cola, el estado, la prioridad, el estado de espera y la asignación a los que alguien filtró le resultan visibles, mientras que el nombre y el estado guardado de un filtro guardado van sellados con la clave de la organización y no. [[#metadata #server-holds]]
**Registros de auditoría y operativos.** El registro de auditoría es seudónimo y en gran parte texto plano por diseño, y contiene un tipo de evento, un identificador de actor, un identificador de caso opcional y un objeto JSON de metadatos, de modo que el navegador de una persona administradora puede consultarlo sin una pasada de descifrado. No lleva contenido de casos, ni números de teléfono, ni alias de clientes. Los contadores de límite de tasa, las filas de la cola de trabajos, los tokens de sesión y el registro de auditoría de evaluación de claves son datos del nivel operativo que el servidor lee directamente, mientras que la dirección IP y el agente de usuario registrados en una sesión van sellados con la clave de la organización y no lo son. [[#server-holds #metadata #privacy]]
**Dónde vive la aplicación de las reglas.** Toda decisión de acceso es autoritativa en el servidor, y que el cliente oculte un control es solo comodidad. [[#permissions #trust-boundary]]
- El acceso a los casos pasa por \`packages/server/src/tickets/access.ts\`. [[#permissions #trust-boundary]]
- Las comprobaciones de permisos pasan por \`packages/server/src/auth/roles.ts\` y \`role-middleware.ts\`. [[#permissions]]
- La política por canal pasa por aserciones en la capa de servicios en cada manejador de relay y en cada procedimiento tRPC. [[#permissions #telephony]]
- El aislamiento entre organizaciones pasa por el ámbito de esquema de Kysely en \`packages/server/src/db/\`. [[#permissions #server-holds]]
Quien contribuye una consulta decide en qué lado de la frontera se ejecuta su filtro, y un filtro que el servidor evalúa es un filtro que el servidor puede leer. [[#permissions #trust-boundary]]`)
};

/**
* | output |
* | --- |
* | "The trust boundary is the line between what the server can read and what only a browser can read, and knowing where it sits is how an organization decides wh..." |
*
* @param {Demo_Narrative_Deepdive_Trust_Boundary_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_trust_boundary_body = /** @type {((inputs?: Demo_Narrative_Deepdive_Trust_Boundary_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Trust_Boundary_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_trust_boundary_body(inputs)
	return en_demo_narrative_deepdive_trust_boundary_body(inputs)
});