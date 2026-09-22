/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Call_Log_BodyInputs */

const en_demo_narrative_admin_call_log_body = /** @type {(inputs: Demo_Narrative_Admin_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The call history lists every call and voicemail recorded against a ticket, newest first, fifty at a time, and carries no phone number at any point. Each row names the client by the alias the browser opens with the organization key, and the rest of the row is plaintext the server already holds. [[#telephony #privacy]]
**What a row is made of.** The list is built from the call and voicemail entries on ticket threads rather than from provider records, so a row exists because a call was written to a case, and it carries that call's direction, its outcome, how long it lasted, when it happened and which ticket it belongs to. A call whose follow-up was deleted from the thread is absent from the list. [[#metadata]]
**Who sees which calls.** Permission to view reports opens the page, and the query applies no queue condition, so an account holding that permission sees calls on tickets in queues it is not a member of. The alias still needs the organization key to read, and the ticket behind the row still needs the ticket key, so a row can name a call the account cannot open. [The permission system](#deep-dive/the-permission-system) covers where the permission comes from. [[#permissions #encryption]]
**What the history is worth to an attacker.** Timing, direction, duration and outcome for every call an organization made or took, with aliases in place of numbers. That pattern shows when an organization is busy, how long its calls run and how often a call fails. The content of the call is not in it, and the numbers are not in it. [The trust boundary](#deep-dive/the-trust-boundary) covers what else the plaintext columns give away. [[#server-holds #metadata]]
**Where the rows go when a case is purged.** These rows are follow-ups on tickets, so the retention purge takes them with the ticket they belong to, and a closed case that has aged out leaves no call history behind. [Data retention](#deep-dive/data-retention) covers the purge. [[#retention]]
**The call log query.** \`callLog\` in \`packages/server/src/tickets/reports-service.ts\` filters follow-ups of type \`phone_call\` and \`voicemail\` that are not soft-deleted, maps direction onto the follow-up's source, and builds its count and its page from one filtered base so the two cannot drift. Filters for direction, outcome and date range travel as query parameters and are applied in SQL. [[#metadata]]`)
};

const es_demo_narrative_admin_call_log_body = /** @type {(inputs: Demo_Narrative_Admin_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El historial de llamadas enumera todas las llamadas y los mensajes de voz registrados en un ticket, del más reciente al más antiguo, de cincuenta en cincuenta, y no lleva ningún número de teléfono en ningún momento. Cada fila nombra al cliente con el alias que el navegador abre con la clave de la organización, y el resto de la fila es texto plano que el servidor ya tiene. [[#telephony #privacy]]
**De qué se compone una fila.** La lista se construye a partir de las entradas de llamada y de mensaje de voz de los hilos de los tickets y no de los registros del proveedor, de modo que una fila existe porque una llamada quedó escrita en un caso, y lleva el sentido de esa llamada, su resultado, cuánto duró, cuándo ocurrió y a qué ticket pertenece. Una llamada cuyo seguimiento se eliminó del hilo no figura en la lista. [[#metadata]]
**Quién ve qué llamadas.** El permiso para ver reportes abre la página, y la consulta no aplica ninguna condición de cola, así que una cuenta con ese permiso ve llamadas de tickets de colas a las que no pertenece. El alias sigue necesitando la clave de la organización para leerse, y el ticket que hay detrás de la fila sigue necesitando la clave del ticket, de modo que una fila puede nombrar una llamada que la cuenta no puede abrir. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde sale el permiso. [[#permissions #encryption]]
**Qué vale el historial para quien ataca.** El momento, el sentido, la duración y el resultado de todas las llamadas que una organización hizo o recibió, con alias en lugar de números. Ese patrón muestra cuándo tiene trabajo una organización, cuánto duran sus llamadas y con qué frecuencia falla una. El contenido de la llamada no está ahí, y los números tampoco. [La frontera de confianza](#deep-dive/the-trust-boundary) trata qué más revelan las columnas en texto plano. [[#server-holds #metadata]]
**Adónde van las filas cuando se purga un caso.** Estas filas son seguimientos de tickets, así que la purga de retención se las lleva con el ticket al que pertenecen, y un caso cerrado que ha cumplido su plazo no deja ningún historial de llamadas. [Retención de datos](#deep-dive/data-retention) trata la purga. [[#retention]]
**La consulta del historial.** \`callLog\`, en \`packages/server/src/tickets/reports-service.ts\`, filtra los seguimientos de tipo \`phone_call\` y \`voicemail\` que no estén marcados como eliminados, deriva el sentido del origen del seguimiento y construye su recuento y su página sobre una misma base filtrada para que los dos no se separen. Los filtros de sentido, resultado y rango de fechas viajan como parámetros de consulta y se aplican en SQL. [[#metadata]]`)
};

const en_xa2_demo_narrative_admin_call_log_body = /** @type {(inputs: Demo_Narrative_Admin_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò phònè nùmbèr àppèàrs ànywhèrè ìn thè càll lòg. Thè clìènt àlìàs òn èàch ròw ìs dècryptèd ìn thè bròwsèr wìth thè òrgànìzàtìòn kèy ànd ìs thè ònly èncryptèd vàlùè. Thè sèrvèr rèàds plàìntèxt mètàdàtà fòr tìmèstàmps, dùràtìòn, ànd stàtùs wìthòùt àccèssìng àny èncryptèd còntènt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Fìltèrs. •••** Fìltèr sèlèctìòns fòr dìrèctìòn, càll stàtùs, ànd dàtè ràngè àrè sènt tò thè sèrvèr às qùèry pàràmètèrs.
 ••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Vìèwìng thè càll lòg rèqùìrès thè Vìèw rèpòrts pèrmìssìòn, whìch gàtès thè èntìrè lògs pàgè. ••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The call history lists every call and voicemail recorded against a ticket, newest first, fifty at a time, and carries no phone number at any point. Each row ..." |
*
* @param {Demo_Narrative_Admin_Call_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_call_log_body = /** @type {((inputs?: Demo_Narrative_Admin_Call_Log_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Call_Log_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_call_log_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_call_log_body(inputs)
	return en_demo_narrative_admin_call_log_body(inputs)
});