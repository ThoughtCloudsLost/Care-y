/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Needs_Attention_BodyInputs */

const en_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A ticket appears here when it is open, not on hold, urgent or high priority, and either unassigned or assigned to the user with unread replies. The section is absent when nothing meets that rule. [[#client-data #privacy]]
**Where unread comes from.** Each account keeps its own read position on each ticket, stored as ciphertext only that account can open and decrypted in the crypto worker. Nothing derived from read state is sent back, so the server cannot tell which tickets anyone has read. Membership settles as those positions decrypt, so the section fills in over the first moments of a load rather than arriving complete. [[#encryption #privacy]]
**What the rule does not reach.** The overview holds one page of open tickets and does not run the full read-state sweep, so the rule is applied to the rows it loaded. A ticket in an accessible queue beyond that page does not qualify here even when it qualifies on the tickets list, where the sweep runs. [Filters](#tickets/filters) covers the same rule applied there. [[#failure-states]]
**The rule and the bucketing pass.** \`isNeedsAttention\` and \`bucketTickets\` in \`packages/client/src/lib/components/dashboard/filters.ts\` are shared with the tickets-page membership filter, so the see-all landing shows the same set. Read state is assembled in \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\` and the cursor row is \`048_create_ticket_read_cursors.ts\`. [Unread badges](#tickets/unread-badges) covers how a reply counts as unread. [[#client-data]]`)
};

const es_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un ticket aparece aquí cuando está abierto, no está en espera, tiene prioridad urgente o alta y está sin asignar o asignado a la persona usuaria con respuestas sin leer. La sección no aparece cuando nada cumple esa regla. [[#client-data #privacy]]
**De dónde sale lo no leído.** Cada cuenta mantiene su propia posición de lectura en cada ticket, guardada como texto cifrado que solo esa cuenta puede abrir y descifrada en el worker criptográfico. Nada derivado del estado de lectura se devuelve, así que el servidor no puede saber qué tickets ha leído nadie. La pertenencia a la sección se asienta a medida que esas posiciones se descifran, de modo que la sección se completa durante los primeros instantes de una carga en lugar de llegar entera. [[#encryption #privacy]]
**Hasta dónde llega la regla.** El resumen tiene una sola página de tickets abiertos y no ejecuta el barrido completo del estado de lectura, así que la regla se aplica a las filas que cargó. Un ticket de una cola accesible más allá de esa página no cumple la regla aquí aunque sí la cumpla en la lista de tickets, donde el barrido sí se ejecuta. [Filtros](#tickets/filters) trata esa misma regla aplicada allí. [[#failure-states]]
**La regla y el paso de clasificación.** \`isNeedsAttention\` y \`bucketTickets\`, en \`packages/client/src/lib/components/dashboard/filters.ts\`, se comparten con el filtro de pertenencia de la página de tickets, de modo que el destino de "ver todos" muestra el mismo conjunto. El estado de lectura se arma en \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\` y la fila del cursor es \`048_create_ticket_read_cursors.ts\`. [Insignias de no leídos](#tickets/unread-badges) trata cuándo una respuesta cuenta como no leída. [[#client-data]]`)
};

const en_xa2_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À pèr-vòlùntèèr lìst òf tìckèts nèèdìng ìmmèdìàtè àctìòn.
 ••••••••••••••••••**Whàt qùàlìfìès. •••••** À tìckèt àppèàrs hèrè whèn ìt ìs òpèn, nòt òn hòld, màrkèd ùrgènt òr hìgh prìòrìty, ànd èìthèr ùnàssìgnèd òr àssìgnèd tò thè cùrrènt vòlùntèèr wìth ùnrèàd rèplìès.
 ••••••••••••••••••••••••••••••••••••••••••••••••••**Vìsìbìlìty. ••••** Thè sèctìòn ònly àppèàrs whèn àt lèàst ònè tìckèt qùàlìfìès. Òthèrwìsè ìt ìs hìddèn èntìrèly. •••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A ticket appears here when it is open, not on hold, urgent or high priority, and either unassigned or assigned to the user with unread replies. The section i..." |
*
* @param {Demo_Narrative_Dashboard_Needs_Attention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_needs_attention_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_needs_attention_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_needs_attention_body(inputs)
	return en_demo_narrative_dashboard_needs_attention_body(inputs)
});