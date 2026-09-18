/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_My_Tickets_BodyInputs */

const en_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All open tickets assigned to the current volunteer. This is the primary working list for day-to-day case management. The count next to the section heading reflects the total number of open assigned tickets, the same number shown on the shift card.
Tickets on hold appear in a separate section rather than here.`)
};

const es_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todos los tickets abiertos asignados al voluntario actual. Esta es la lista de trabajo principal para la gestión diaria de casos. El conteo junto al encabezado de la sección refleja el total de tickets abiertos asignados, el mismo número que aparece en la tarjeta de turno.
Los tickets en espera aparecen en una sección separada.`)
};

/**
* | output |
* | --- |
* | "All open tickets assigned to the current volunteer. This is the primary working list for day-to-day case management. The count next to the section heading re..." |
*
* @param {Demo_Narrative_Dashboard_My_Tickets_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_my_tickets_body = /** @type {((inputs?: Demo_Narrative_Dashboard_My_Tickets_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_My_Tickets_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_my_tickets_body(inputs)
	return en_demo_narrative_dashboard_my_tickets_body(inputs)
});