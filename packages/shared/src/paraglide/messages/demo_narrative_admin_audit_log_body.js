/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Audit_Log_BodyInputs */

const en_demo_narrative_admin_audit_log_body = /** @type {(inputs: Demo_Narrative_Admin_Audit_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The audit log is the organization's record of who did what, covering ticket lifecycle, client records, queues, roles and permissions, intake forms, portal channels, key operations and the voicemail quarantine. Every entry is an append, the service offers no update and no delete path, and no route exposes one. [[#permissions #server-holds]]
**Which permission opens what.** Permission to view reports opens the logs page, and permission to view the audit log is what the audit tab needs on top of it. An account without the second one is not offered the tab, and a link straight to it is answered with a refusal that names the missing permission rather than being redirected without explanation. [The permission system](#deep-dive/the-permission-system) covers how each is granted. [[#permissions]]
**What a row can and cannot say.** A row holds the event type, the account that acted, the ticket it acted on, a metadata object and a timestamp, all plaintext, and the service writes no names, numbers or message content into any of them. The actor's name beside a row is organization-key ciphertext the browser opens, and an action taken by the system itself is recorded against a fixed system actor rather than a person. [Recent activity](#dashboard/activity) covers the same row as the dashboard feed reads it. [[#privacy #encryption]]
**What the whole log gives away.** Read together, the rows are a timeline of an organization's operations, showing when accounts were active, how often cases are opened and closed, when permissions changed and when keys were rotated. That pattern is the cost of having an operational record at all, and it is paid in pseudonyms, since nothing in a row identifies a client or repeats what was said. [The trust boundary](#deep-dive/the-trust-boundary) covers the plaintext columns elsewhere in the schema. [[#metadata #server-holds]]
**Why the log outlives the cases.** The retention purge deletes tickets, their threads and their call records, and leaves the audit log alone, so the record of an action survives the case it was taken on. An audit row referring to a purged ticket keeps the identifier, which resolves to nothing. [Data retention](#deep-dive/data-retention) covers what the purge takes. [[#retention]]
**The query and its filters.** \`query\` in \`packages/server/src/tickets/audit.ts\` pages fifty rows at a time, newest first, and filters for event type, actor, ticket and date range are applied in SQL, with the same predicates built onto the count. Writes are best-effort, so a failed audit insert is swallowed so it never blocks the operation that triggered it, which means an audit gap is possible where a database write failed. [[#failure-states]]`)
};

const es_demo_narrative_admin_audit_log_body = /** @type {(inputs: Demo_Narrative_Admin_Audit_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El registro de auditoría es la constancia que tiene la organización de quién hizo qué, y abarca el ciclo de vida de los tickets, los registros de clientes, las colas, los roles y permisos, los formularios de admisión, los canales del portal, las operaciones con claves y la cuarentena de mensajes de voz. Cada entrada es una inserción, el servicio no ofrece ninguna ruta de actualización ni de borrado, y ninguna ruta las expone. [[#permissions #server-holds]]
**Qué abre cada permiso.** El permiso para ver reportes abre la página de registros, y el permiso para leer el registro de auditoría es lo que hace falta además para la pestaña de auditoría. A una cuenta sin el segundo no se le ofrece la pestaña, y un enlace directo a ella recibe un rechazo que nombra el permiso que falta en lugar de una redirección sin explicación. [El sistema de permisos](#deep-dive/the-permission-system) explica cómo se concede cada uno. [[#permissions]]
**Lo que una fila puede decir y lo que no.** Una fila guarda el tipo de evento, la cuenta que actuó, el ticket sobre el que actuó, un objeto de metadatos y una marca de tiempo, todo en texto plano, y el servicio no escribe en ninguno de ellos nombres, números ni contenido de mensajes. El nombre de quien actuó que acompaña a la fila es texto cifrado con la clave de la organización que abre el navegador, y una acción del propio sistema queda registrada a nombre de un actor de sistema fijo y no de una persona. [Actividad reciente](#dashboard/activity) trata esa misma fila tal como la lee el resumen. [[#privacy #encryption]]
**Lo que revela el registro completo.** Leídas en conjunto, las filas son una cronología de la operación de una organización, y muestran cuándo estuvieron activas las cuentas, con qué frecuencia se abren y se cierran casos, cuándo cambiaron los permisos y cuándo se rotaron las claves. Ese patrón es el precio de tener una constancia operativa, y se paga en seudónimos, porque nada de una fila identifica a un cliente ni repite lo que se dijo. [La frontera de confianza](#deep-dive/the-trust-boundary) trata las columnas en texto plano del resto del esquema. [[#metadata #server-holds]]
**Por qué el registro sobrevive a los casos.** La purga de retención elimina los tickets, sus hilos y sus registros de llamadas, y deja intacto el registro de auditoría, de modo que la constancia de una acción sobrevive al caso sobre el que se tomó. Una fila de auditoría que se refiere a un ticket purgado conserva el identificador, que ya no lleva a ninguna parte. [Retención de datos](#deep-dive/data-retention) trata lo que se lleva la purga. [[#retention]]
**La consulta y sus filtros.** \`query\`, en \`packages/server/src/tickets/audit.ts\`, pagina cincuenta filas cada vez, de la más reciente a la más antigua, y los filtros de tipo de evento, actor, ticket y rango de fechas se aplican en SQL, con los mismos predicados puestos sobre el recuento. Las escrituras son de mejor esfuerzo, así que una inserción de auditoría fallida se descarta para que nunca bloquee la operación que la provocó, lo que significa que puede haber un hueco en el registro allí donde falló una escritura en la base de datos. [[#failure-states]]`)
};

const en_xa2_demo_narrative_admin_audit_log_body = /** @type {(inputs: Demo_Narrative_Admin_Audit_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè àùdìt lòg rècòrds 47 èvènt typès spànnìng thè fùll ràngè òf àdmìnìstràtìvè ànd lìfècyclè àctìòns àcròss thè òrgànìzàtìòn.
 ••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr hòlds. •••••••** Thè àùdìt sèrvìcè àccèpts ònly àppènds wìth nò ùpdàtè òr dèlètè pàth ànd stòrès ìdèntìfìèrs ònly, nèvèr nàmès, phònè nùmbèrs, òr tìckèt còntènt. Thè àctòr's dìsplày nàmè ìs rèsòlvèd fròm àn ìdèntìfìèr ànd dècryptèd ìn thè bròwsèr wìth thè òrgànìzàtìòn kèy.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Fìltèrs. •••** Fìltèr sèlèctìòns fòr èvènt typè, àctòr, ànd dàtè ràngè àrè sènt tò thè sèrvèr às qùèry pàràmètèrs.
 •••••••••••••••••••••••••••••••**Pèrsìstèncè. ••••** Àùdìt èntrìès àrè èxèmpt fròm thè dàtà rètèntìòn pòlìcy bècàùsè thèy sèrvè às thè òrgànìzàtìòn's òpèràtìònàl rècòrd.
 ••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Thè Vìèw rèpòrts pèrmìssìòn gàtès thè lògs pàgè, ànd thè Vìèw àùdìt lòg pèrmìssìòn gàtès thè àùdìt tàb wìthìn ìt. Vìèw àùdìt lòg ìs à dèfàùlt mànàgèr pèrmìssìòn. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The audit log is the organization's record of who did what, covering ticket lifecycle, client records, queues, roles and permissions, intake forms, portal ch..." |
*
* @param {Demo_Narrative_Admin_Audit_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_audit_log_body = /** @type {((inputs?: Demo_Narrative_Admin_Audit_Log_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Audit_Log_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_audit_log_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_audit_log_body(inputs)
	return en_demo_narrative_admin_audit_log_body(inputs)
});