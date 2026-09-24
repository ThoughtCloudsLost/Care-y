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

const en_xa2_demo_narrative_admin_terminology_heading = /** @type {(inputs: Demo_Narrative_Admin_Terminology_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèrmìnòlògy ••••⟧`)
};

/**
* | output |
* | --- |
* | "Terminology" |
*
* @param {Demo_Narrative_Admin_Terminology_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_terminology_heading = /** @type {((inputs?: Demo_Narrative_Admin_Terminology_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Terminology_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_terminology_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_terminology_heading(inputs)
	return en_demo_narrative_admin_terminology_heading(inputs)
});