/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Terminology_HeadingInputs */

const en_demo_narrative_admin_terminology_heading = /** @type {(inputs: Demo_Narrative_Admin_Terminology_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminology`)
};

const es_demo_narrative_admin_terminology_heading = /** @type {(inputs: Demo_Narrative_Admin_Terminology_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminología`)
};

/**
* | output |
* | --- |
* | "Terminology" |
*
* @param {Demo_Narrative_Admin_Terminology_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_terminology_heading = /** @type {((inputs?: Demo_Narrative_Admin_Terminology_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Terminology_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_terminology_heading(inputs)
	return es_demo_narrative_admin_terminology_heading(inputs)
});