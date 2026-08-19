/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_On_Hold_BodyInputs */

const en_demo_narrative_dashboard_on_hold_body = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets that a volunteer has placed on hold. A ticket on hold is still open but temporarily set aside, usually because the volunteer is waiting for a response from the client or an external party.
**Visibility.** This section only appears on the dashboard when at least one ticket is on hold and is hidden otherwise, and like unassigned it starts collapsed.
**Resuming.** When the volunteer is ready to return to a ticket on hold, they can change its status back to active from the ticket detail view. The ticket then moves back to the my tickets section.`)
};

const es_demo_narrative_dashboard_on_hold_body = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets que un voluntario ha puesto en espera. Un ticket en espera sigue abierto pero temporalmente apartado, normalmente porque el voluntario esta esperando una respuesta del cliente o de una parte externa.
**Visibilidad.** Esta seccion solo aparece en el panel principal cuando al menos un ticket esta en espera y se oculta de lo contrario, y al igual que sin asignar comienza colapsada.
**Reanudar.** Cuando el voluntario esta listo para volver a un ticket en espera, puede cambiar su estado a activo desde la vista detallada del ticket. El ticket entonces vuelve a la seccion de mis tickets.`)
};

/**
* | output |
* | --- |
* | "Tickets that a volunteer has placed on hold. A ticket on hold is still open but temporarily set aside, usually because the volunteer is waiting for a respons..." |
*
* @param {Demo_Narrative_Dashboard_On_Hold_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_on_hold_body = /** @type {((inputs?: Demo_Narrative_Dashboard_On_Hold_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_On_Hold_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_on_hold_body(inputs)
	return es_demo_narrative_dashboard_on_hold_body(inputs)
});