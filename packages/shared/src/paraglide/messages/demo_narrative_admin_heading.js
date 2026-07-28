/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_HeadingInputs */

const en_demo_narrative_admin_heading = /** @type {(inputs: Demo_Narrative_Admin_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization overview`)
};

const es_demo_narrative_admin_heading = /** @type {(inputs: Demo_Narrative_Admin_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista general de la organizacion`)
};

/**
* | output |
* | --- |
* | "Organization overview" |
*
* @param {Demo_Narrative_Admin_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_heading = /** @type {((inputs?: Demo_Narrative_Admin_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_heading(inputs)
	return es_demo_narrative_admin_heading(inputs)
});