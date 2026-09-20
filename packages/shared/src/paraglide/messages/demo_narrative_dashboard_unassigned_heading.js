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

const en_xa2_demo_narrative_dashboard_unassigned_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnàssìgnèd tìckèts ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Unassigned tickets" |
*
* @param {Demo_Narrative_Dashboard_Unassigned_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_unassigned_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_Unassigned_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Unassigned_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_unassigned_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_unassigned_heading(inputs)
	return en_demo_narrative_dashboard_unassigned_heading(inputs)
});