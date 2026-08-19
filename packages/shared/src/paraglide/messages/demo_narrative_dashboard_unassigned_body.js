/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Unassigned_BodyInputs */

const en_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open tickets that have not been assigned to any volunteer. These are waiting to be picked up.
**Claiming a ticket.** Volunteers can assign an unassigned ticket to themselves directly from this list using a quick action, or from the ticket detail view. Once assigned, the ticket moves from this section to the assignee's my tickets section.
**Count.** The count shown may differ from the number of tickets visible in the list because the server returns a total that includes tickets the volunteer has not yet decrypted. The visible list shows only the tickets whose titles the browser has already unlocked.
**Collapsed by default.** This section starts collapsed to keep the dashboard focused on assigned work, and the section button row or the section header expands it.`)
};

const es_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets abiertos que no han sido asignados a ningun voluntario. Estan esperando a ser tomados.
**Tomar un ticket.** Los voluntarios pueden asignarse un ticket sin asignar directamente desde esta lista usando una accion rapida, o desde la vista detallada del ticket. Una vez asignado, el ticket pasa de esta seccion a la seccion de mis tickets del asignado.
**Conteo.** El conteo mostrado puede diferir del numero de tickets visibles en la lista porque el servidor devuelve un total que incluye tickets que el voluntario aun no ha descifrado. La lista visible muestra solo los tickets cuyos titulos el navegador ya ha desbloqueado.
**Colapsado por defecto.** Esta seccion comienza colapsada para mantener el panel principal enfocado en el trabajo asignado, y la fila de botones de seccion o el encabezado de seccion la expande.`)
};

/**
* | output |
* | --- |
* | "Open tickets that have not been assigned to any volunteer. These are waiting to be picked up. **Claiming a ticket.** Volunteers can assign an unassigned tick..." |
*
* @param {Demo_Narrative_Dashboard_Unassigned_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_unassigned_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Unassigned_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Unassigned_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_unassigned_body(inputs)
	return es_demo_narrative_dashboard_unassigned_body(inputs)
});