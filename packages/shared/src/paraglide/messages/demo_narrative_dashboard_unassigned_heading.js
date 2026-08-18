/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Unassigned_HeadingInputs */

const en_demo_narrative_dashboard_unassigned_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unassigned tickets`)
};

const es_demo_narrative_dashboard_unassigned_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets sin asignar`)
};

/**
* | output |
* | --- |
* | "Unassigned tickets" |
*
* @param {Demo_Narrative_Dashboard_Unassigned_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_unassigned_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_Unassigned_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Unassigned_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_unassigned_heading(inputs)
	return es_demo_narrative_dashboard_unassigned_heading(inputs)
});