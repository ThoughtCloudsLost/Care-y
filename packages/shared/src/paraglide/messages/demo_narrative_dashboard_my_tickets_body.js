/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_My_Tickets_BodyInputs */

const en_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All open tickets currently assigned to the volunteer. This is the primary working list for day to day case management.
**What appears here.** Every ticket where the volunteer is the current assignee and the ticket is not closed. Tickets on hold appear in their own section instead.
**Navigation.** Tapping a ticket opens its detail view where the volunteer can read messages, reply, add notes, and review case metadata.
**Counts.** The count next to the section heading is the total number of open tickets assigned to the volunteer. This number also appears on the shift card for quick reference.`)
};

const es_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todos los tickets abiertos asignados actualmente al voluntario. Esta es la lista de trabajo principal para la gestión diaria de casos.
**Qué aparece aquí.** Cada ticket donde el voluntario es el asignado actual y el ticket no está cerrado. Los tickets en espera aparecen en su propia sección.
**Navegación.** Tocar un ticket abre su vista detallada donde el voluntario puede leer mensajes, responder, añadir notas y revisar los metadatos del caso.
**Conteos.** El conteo junto al encabezado de la sección es el número total de tickets abiertos asignados al voluntario. Este número también aparece en la tarjeta de turno como referencia rápida.`)
};

/**
* | output |
* | --- |
* | "All open tickets currently assigned to the volunteer. This is the primary working list for day to day case management. **What appears here.** Every ticket wh..." |
*
* @param {Demo_Narrative_Dashboard_My_Tickets_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_my_tickets_body = /** @type {((inputs?: Demo_Narrative_Dashboard_My_Tickets_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_My_Tickets_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_my_tickets_body(inputs)
	return es_demo_narrative_dashboard_my_tickets_body(inputs)
});