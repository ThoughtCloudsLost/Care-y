/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_On_Hold_HeadingInputs */

const en_demo_narrative_dashboard_on_hold_heading = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`On hold tickets`)
};

const es_demo_narrative_dashboard_on_hold_heading = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets en espera`)
};

/**
* | output |
* | --- |
* | "On hold tickets" |
*
* @param {Demo_Narrative_Dashboard_On_Hold_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_on_hold_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_On_Hold_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_On_Hold_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_on_hold_heading(inputs)
	return es_demo_narrative_dashboard_on_hold_heading(inputs)
});