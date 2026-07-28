/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_HeadingInputs */

const en_demo_narrative_dashboard_heading = /** @type {(inputs: Demo_Narrative_Dashboard_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your home screen`)
};

const es_demo_narrative_dashboard_heading = /** @type {(inputs: Demo_Narrative_Dashboard_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu pantalla de inicio`)
};

/**
* | output |
* | --- |
* | "Your home screen" |
*
* @param {Demo_Narrative_Dashboard_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_heading(inputs)
	return es_demo_narrative_dashboard_heading(inputs)
});