/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_My_Tickets_BodyInputs */

const en_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open tickets assigned to the user collect here, and a hold takes one out of the set until it is lifted. The count beside the heading is the number of tickets in that set, and the shift line reports the same number. [[#client-data]]
**One page behind four sections.** The overview asks once for up to a hundred open tickets from the queues the user belongs to and sorts them into sections in the browser, so My tickets, [Needs attention](#dashboard/needs-attention), [Unassigned](#dashboard/unassigned) and [On hold](#dashboard/on-hold) are four cuts of one page rather than four queries. An organization with more than a hundred open tickets gets the newest hundred, and every section under it describes that page. [[#failure-states]]
**When a title does not appear.** A ticket's title and description are encrypted under a key belonging to that ticket, wrapped separately for each account permitted to read it. A ticket in an accessible queue whose key was never wrapped for the account lists with its plaintext fields, which are the queue, the priority, the status and the times, and a placeholder where the title would be. [Ticket decryption](#tickets/decryption) covers the wrapping. [[#keys #encryption]]
**The list query and the bucketing.** The request is a single-page infinite query in \`packages/client/src/routes/(app)/+page.svelte\`, shaped that way so the quick-action composables it shares with the tickets list operate on one cache shape. The hundred is the ceiling in \`ticketListInputSchema\` in \`packages/shared/src/schemas/tickets.ts\`, and the sorting is \`bucketTickets\` in \`packages/client/src/lib/components/dashboard/filters.ts\`, one pass over the page. [Quick actions](#tickets/quick-actions) covers the actions on each row. [[#client-data]]`)
};

const es_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los tickets abiertos asignados a la persona usuaria se reúnen aquí, y una espera saca a uno del conjunto hasta que se levanta. El recuento junto al encabezado es el número de tickets de ese conjunto, y la línea de turno indica ese mismo número. [[#client-data]]
**Una sola página detrás de cuatro secciones.** El resumen pide una vez hasta cien tickets abiertos de las colas a las que pertenece la persona usuaria y los reparte en secciones dentro del navegador, de modo que Mis tickets, [Necesita atención](#dashboard/needs-attention), [Sin asignar](#dashboard/unassigned) y [En espera](#dashboard/on-hold) son cuatro cortes de una misma página y no cuatro consultas. Una organización con más de cien tickets abiertos recibe los cien más recientes, y todas las secciones describen esa página. [[#failure-states]]
**Cuando un título no aparece.** El título y la descripción de un ticket están cifrados con una clave propia de ese ticket, envuelta por separado para cada cuenta con permiso para leerlo. Un ticket de una cola accesible cuya clave nunca se envolvió para la cuenta figura en la lista con sus campos en claro, que son la cola, la prioridad, el estado y las fechas, y un marcador donde iría el título. [Descifrado de tickets](#tickets/decryption) trata ese envoltorio. [[#keys #encryption]]
**La consulta de la lista y el reparto.** La petición es una consulta infinita de una sola página en \`packages/client/src/routes/(app)/+page.svelte\`, con esa forma para que las utilidades de acciones rápidas que comparte con la lista de tickets operen sobre una única forma de caché. Los cien son el tope de \`ticketListInputSchema\`, en \`packages/shared/src/schemas/tickets.ts\`, y el reparto es \`bucketTickets\`, en \`packages/client/src/lib/components/dashboard/filters.ts\`, una sola pasada sobre la página. [Acciones rápidas](#tickets/quick-actions) trata las acciones de cada fila. [[#client-data]]`)
};

const en_xa2_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àll òpèn tìckèts àssìgnèd tò thè cùrrènt vòlùntèèr. Thìs ìs thè prìmàry wòrkìng lìst fòr dày-tò-dày càsè mànàgèmènt. Thè còùnt nèxt tò thè sèctìòn hèàdìng rèflècts thè tòtàl nùmbèr òf òpèn àssìgnèd tìckèts, thè sàmè nùmbèr shòwn òn thè shìft càrd.
Tìckèts òn hòld àppèàr ìn à sèpàràtè sèctìòn ràthèr thàn hèrè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open tickets assigned to the user collect here, and a hold takes one out of the set until it is lifted. The count beside the heading is the number of tickets..." |
*
* @param {Demo_Narrative_Dashboard_My_Tickets_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_my_tickets_body = /** @type {((inputs?: Demo_Narrative_Dashboard_My_Tickets_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_My_Tickets_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_my_tickets_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_my_tickets_body(inputs)
	return en_demo_narrative_dashboard_my_tickets_body(inputs)
});