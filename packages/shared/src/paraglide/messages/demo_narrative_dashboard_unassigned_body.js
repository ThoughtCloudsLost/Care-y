/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Unassigned_BodyInputs */

const en_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open tickets not yet assigned to anyone. Once assigned, a ticket moves to the assignee's working list.
**If counts differ.** The count in the section heading reflects the full total, while the visible rows may be fewer because the overview fetches a limited page of results.`)
};

const es_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets abiertos aún sin asignar a nadie. Una vez asignado, un ticket pasa a la lista de trabajo de la persona asignada.
**Si los conteos difieren.** El conteo en el encabezado de la sección refleja el total completo, mientras que las filas visibles pueden ser menos porque el resumen obtiene una página limitada de resultados.`)
};

/**
* | output |
* | --- |
* | "Open tickets not yet assigned to anyone. Once assigned, a ticket moves to the assignee's working list. **If counts differ.** The count in the section heading..." |
*
* @param {Demo_Narrative_Dashboard_Unassigned_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_unassigned_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Unassigned_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Unassigned_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_unassigned_body(inputs)
	return en_demo_narrative_dashboard_unassigned_body(inputs)
});