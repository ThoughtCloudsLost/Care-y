/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Responses_TitleInputs */

const en_demo_section_admin_responses_title = /** @type {(inputs: Demo_Section_Admin_Responses_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake responses`)
};

const es_demo_section_admin_responses_title = /** @type {(inputs: Demo_Section_Admin_Responses_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas de admisión`)
};

const en_xa2_demo_section_admin_responses_title = /** @type {(inputs: Demo_Section_Admin_Responses_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè rèspònsès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Intake responses" |
*
* @param {Demo_Section_Admin_Responses_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_responses_title = /** @type {((inputs?: Demo_Section_Admin_Responses_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Responses_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_responses_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_admin_responses_title(inputs)
	return en_demo_section_admin_responses_title(inputs)
});