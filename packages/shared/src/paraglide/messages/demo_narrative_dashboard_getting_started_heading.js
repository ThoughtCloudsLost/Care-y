/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Getting_Started_HeadingInputs */

const en_demo_narrative_dashboard_getting_started_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Getting started checklist`)
};

const es_demo_narrative_dashboard_getting_started_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lista de primeros pasos`)
};

/**
* | output |
* | --- |
* | "Getting started checklist" |
*
* @param {Demo_Narrative_Dashboard_Getting_Started_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_getting_started_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_Getting_Started_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Getting_Started_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_getting_started_heading(inputs)
	return es_demo_narrative_dashboard_getting_started_heading(inputs)
});