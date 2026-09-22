/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Activity_BodyInputs */

const en_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The feed is the audit log narrowed to tickets in the queues the user belongs to, newest first, five events at a time. Only events tied to a ticket appear, so organization-level actions are absent from it. [[#permissions #metadata]]
**What an audit row holds.** The event type, the account that acted, the ticket it acted on, a metadata object and a timestamp, all plaintext. The service writes no names, numbers or message content, so a row records that a ticket was closed and not what it was about. The client alias and queue name shown beside each event are organization-key ciphertext joined in by the query and opened in the browser. [[#server-holds #encryption]]
**Which events get a name.** Creation, closing, reopening, a follow-up and a mention are labeled. An event type the feed does not recognize is shown with a generic label rather than dropped, so a new event type appears as activity before it has wording. A deployment without the audit service writes no rows at all, and the feed answers empty rather than failing. [[#failure-states]]
**The feed query.** \`listRecentForQueues\` in \`packages/server/src/tickets/audit.ts\` joins the audit log to tickets, clients and queues, and applies no access control of its own: the route hands it the caller's queue ids and nothing else. The audit log is append-only, with no update or delete path. [Audit log](#admin-logs/audit) covers the full log and who has access to it. [[#permissions]]`)
};

const es_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El feed es el registro de auditoría reducido a los tickets de las colas a las que pertenece la persona usuaria, del más reciente al más antiguo, cinco eventos cada vez. Solo aparecen los eventos ligados a un ticket, así que las acciones a nivel de organización no figuran en él. [[#permissions #metadata]]
**Lo que guarda una fila de auditoría.** El tipo de evento, la cuenta que actuó, el ticket sobre el que actuó, un objeto de metadatos y una marca de tiempo, todo en texto plano. El servicio no escribe nombres, números ni contenido de mensajes, de modo que una fila registra que un ticket se cerró y no de qué trataba. El alias del cliente y el nombre de la cola que acompañan a cada evento son texto cifrado con la clave de la organización que la consulta incorpora y que abre el navegador. [[#server-holds #encryption]]
**Qué eventos reciben un nombre.** La creación, el cierre, la reapertura, un seguimiento y una mención llevan etiqueta. Un tipo de evento que el feed no reconoce se muestra con una etiqueta genérica en lugar de descartarse, así que un tipo nuevo aparece como actividad antes de tener redacción propia. Una instalación sin el servicio de auditoría no escribe ninguna fila, y el feed responde vacío en lugar de fallar. [[#failure-states]]
**La consulta del feed.** \`listRecentForQueues\`, en \`packages/server/src/tickets/audit.ts\`, une el registro de auditoría con los tickets, los clientes y las colas, y no aplica ningún control de acceso propio: la ruta le entrega los identificadores de cola de quien consulta y nada más. El registro de auditoría es de solo añadido, sin ninguna ruta de actualización ni de borrado. [Registro de auditoría](#admin-logs/audit) trata el registro completo y quién tiene acceso a él. [[#permissions]]`)
};

const en_xa2_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À chrònòlògìcàl lìst òf rècènt èvènts: nèw tìckèts, stàtùs chàngès, ànd àssìgnmènts.
 ••••••••••••••••••••••••••**Vìsìbìlìty. ••••** Thè fèèd ìs scòpèd tò qùèùès thè cùrrènt vòlùntèèr càn àccèss. Vòlùntèèrs wìth dìffèrènt qùèùè mèmbèrshìps sèè dìffèrènt àctìvìty fèèds.
 ••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Clìènt àlìàsès ànd qùèùè nàmès ìn èàch èvènt àrè èncryptèd wìth thè òrgànìzàtìòn kèy ànd dècryptèd ìn thè bròwsèr àt dìsplày tìmè. Strùctùràl mètàdàtà (èvènt typè, tìckèt ÌD, tìmèstàmp) ìs nòt èncryptèd bècàùsè thè sèrvèr nèèds ìt tò sòrt ànd fìltèr rèsùlts. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The feed is the audit log narrowed to tickets in the queues the user belongs to, newest first, five events at a time. Only events tied to a ticket appear, so..." |
*
* @param {Demo_Narrative_Dashboard_Activity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_activity_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Activity_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Activity_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_activity_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_activity_body(inputs)
	return en_demo_narrative_dashboard_activity_body(inputs)
});