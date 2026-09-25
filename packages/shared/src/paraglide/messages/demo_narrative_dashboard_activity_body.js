/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Activity_BodyInputs */

const en_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The activity feed shows activities from the audit log for tickets in the queues the signed-in user belongs to, newest first. It loads five at a time. [[#permissions #metadata]]
**Activity fields and encryption.** Each activity records its type, an internal ID for the account that acted, an internal ID for the ticket acted on, a metadata object, and a timestamp, all as plaintext on the server. Neither ID is a name or case content. An activity records that a ticket was closed, not what the ticket contained. Volunteer names are encrypted separately. The service writes no phone numbers or message content. The server can see the pattern of which account acted on which ticket and when. The client alias and queue name displayed beside each activity are end-to-end encrypted with the organization key. The query joins them in from their source tables. The browser decrypts them. [[#server-holds #encryption]]
**Activity types.** The feed currently has five activity types:
- Creation: a new ticket is opened, whether by staff or by a client submitting an intake form or calling the intake phone number.
- Closing: someone closes a ticket.
- Reopening: someone reopens a closed ticket.
- Follow-up: a reply or note is added to a ticket's conversation, including messages a client sends through the portal.
- Mention: a follow-up that @-mentions an account is recorded as a mention instead of a follow-up.
An activity type added after these still appears in the feed with a generic label. [[#failure-states]]
**Query path and access control.** \`listRecentForQueues\` in \`packages/server/src/tickets/audit.ts\` joins the audit log to tickets, clients, and queues. It applies no access control of its own. The route passes only the caller's queue IDs to the function. The audit log is append-only with no update or delete path. [Audit log](#admin-logs/audit) covers the full log and who can access it. [[#permissions]]`)
};

const es_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El feed de actividad muestra actividades del registro de auditoría para tickets en las colas a las que pertenece el usuario con sesión iniciada, de la más reciente a la más antigua. Carga cinco a la vez. [[#permissions #metadata]]
**Campos de actividad y cifrado.** Cada actividad registra su tipo, un ID interno de la cuenta que actuó, un ID interno del ticket sobre el que se actuó, un objeto de metadatos y una marca de tiempo, todo como texto plano en el servidor. Ninguno de los dos IDs es un nombre ni contenido del caso. Una actividad registra que un ticket fue cerrado, no lo que el ticket contenía. Los nombres de los voluntarios se cifran por separado. El servicio no registra números de teléfono ni contenido de mensajes. El servidor puede ver el patrón de qué cuenta actuó sobre qué ticket y cuándo. El alias del cliente y el nombre de la cola que se muestran junto a cada actividad están cifrados de extremo a extremo con la clave de la organización. La consulta los une desde sus tablas de origen. El navegador los descifra. [[#server-holds #encryption]]
**Tipos de actividad.** El feed tiene actualmente cinco tipos de actividad:
- Creación: se abre un ticket nuevo, ya sea por parte del personal o por un cliente que envía un formulario de ingreso o llama al número de teléfono de ingreso.
- Cierre: alguien cierra un ticket.
- Reapertura: alguien reabre un ticket cerrado.
- Seguimiento: se añade una respuesta o nota a la conversación de un ticket, incluidos los mensajes que un cliente envía a través del portal.
- Mención: un seguimiento que @-menciona una cuenta se registra como mención en lugar de seguimiento.
Un tipo de actividad añadido después de estos aparece en el feed con una etiqueta genérica. [[#failure-states]]
**Ruta de consulta y control de acceso.** \`listRecentForQueues\` en \`packages/server/src/tickets/audit.ts\` une el registro de auditoría con tickets, clientes y colas. No aplica control de acceso propio. La ruta pasa solo los IDs de cola del usuario que llama a la función. El registro de auditoría es de solo adición, sin ruta de actualización ni eliminación. [Registro de auditoría](#admin-logs/audit) cubre el registro completo y quién puede acceder a él. [[#permissions]]`)
};

const en_xa2_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè àctìvìty fèèd shòws àctìvìtìès fròm thè àùdìt lòg fòr tìckèts ìn thè qùèùès thè sìgnèd-ìn ùsèr bèlòngs tò, nèwèst fìrst. Ìt lòàds fìvè àt à tìmè. [[#pèrmìssìòns #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àctìvìty fìèlds ànd èncryptìòn. ••••••••••** Èàch àctìvìty rècòrds ìts typè, àn ìntèrnàl ÌD fòr thè àccòùnt thàt àctèd, àn ìntèrnàl ÌD fòr thè tìckèt àctèd òn, à mètàdàtà òbjèct, ànd à tìmèstàmp, àll às plàìntèxt òn thè sèrvèr. Nèìthèr ÌD ìs à nàmè òr càsè còntènt. Àn àctìvìty rècòrds thàt à tìckèt wàs clòsèd, nòt whàt thè tìckèt còntàìnèd. Vòlùntèèr nàmès àrè èncryptèd sèpàràtèly. Thè sèrvìcè wrìtès nò phònè nùmbèrs òr mèssàgè còntènt. Thè sèrvèr càn sèè thè pàttèrn òf whìch àccòùnt àctèd òn whìch tìckèt ànd whèn. Thè clìènt àlìàs ànd qùèùè nàmè dìsplàyèd bèsìdè èàch àctìvìty àrè ènd-tò-ènd èncryptèd wìth thè òrgànìzàtìòn kèy. Thè qùèry jòìns thèm ìn fròm thèìr sòùrcè tàblès. Thè bròwsèr dècrypts thèm. [[#sèrvèr-hòlds #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àctìvìty typès. •••••** Thè fèèd cùrrèntly hàs fìvè àctìvìty typès:
- Crèàtìòn: à nèw tìckèt ìs òpènèd, whèthèr by stàff òr by à clìènt sùbmìttìng àn ìntàkè fòrm òr càllìng thè ìntàkè phònè nùmbèr.
- Clòsìng: sòmèònè clòsès à tìckèt.
- Rèòpènìng: sòmèònè rèòpèns à clòsèd tìckèt.
- Fòllòw-ùp: à rèply òr nòtè ìs àddèd tò à tìckèt's cònvèrsàtìòn, ìnclùdìng mèssàgès à clìènt sènds thròùgh thè pòrtàl.
- Mèntìòn: à fòllòw-ùp thàt @-mèntìòns àn àccòùnt ìs rècòrdèd às à mèntìòn ìnstèàd òf à fòllòw-ùp.
Àn àctìvìty typè àddèd àftèr thèsè stìll àppèàrs ìn thè fèèd wìth à gènèrìc làbèl. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Qùèry pàth ànd àccèss còntròl. •••••••••** \`lìstRècèntFòrQùèùès\` ìn \`pàckàgès/sèrvèr/src/tìckèts/àùdìt.ts\` jòìns thè àùdìt lòg tò tìckèts, clìènts, ànd qùèùès. Ìt àpplìès nò àccèss còntròl òf ìts òwn. Thè ròùtè pàssès ònly thè càllèr's qùèùè ÌDs tò thè fùnctìòn. Thè àùdìt lòg ìs àppènd-ònly wìth nò ùpdàtè òr dèlètè pàth. [Àùdìt lòg](#àdmìn-lògs/àùdìt) còvèrs thè fùll lòg ànd whò càn àccèss ìt. [[#pèrmìssìòns]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The activity feed shows activities from the audit log for tickets in the queues the signed-in user belongs to, newest first. It loads five at a time. [[#perm..." |
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