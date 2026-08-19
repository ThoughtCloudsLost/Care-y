/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Create_HeadingInputs */

const en_demo_narrative_dashboard_create_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Create_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create button`)
};

const es_demo_narrative_dashboard_create_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Create_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Botón de crear`)
};

/**
* | output |
* | --- |
* | "Create button" |
*
* @param {Demo_Narrative_Dashboard_Create_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_create_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_Create_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Create_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_create_heading(inputs)
	return es_demo_narrative_dashboard_create_heading(inputs)
});