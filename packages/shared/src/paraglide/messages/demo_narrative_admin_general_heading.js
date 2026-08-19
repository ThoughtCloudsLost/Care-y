/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_General_HeadingInputs */

const en_demo_narrative_admin_general_heading = /** @type {(inputs: Demo_Narrative_Admin_General_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`General info`)
};

const es_demo_narrative_admin_general_heading = /** @type {(inputs: Demo_Narrative_Admin_General_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Información general`)
};

/**
* | output |
* | --- |
* | "General info" |
*
* @param {Demo_Narrative_Admin_General_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_general_heading = /** @type {((inputs?: Demo_Narrative_Admin_General_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_General_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_general_heading(inputs)
	return es_demo_narrative_admin_general_heading(inputs)
});