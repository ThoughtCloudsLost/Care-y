/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_Segment_HintInputs */

const en_admin_templates_segment_hint = /** @type {(inputs: Admin_Templates_Segment_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Messages longer than 160 characters will be split into multiple texts.`)
};

const es_admin_templates_segment_hint = /** @type {(inputs: Admin_Templates_Segment_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los mensajes de mas de 160 caracteres se dividiran en varios textos.`)
};

/**
* | output |
* | --- |
* | "Messages longer than 160 characters will be split into multiple texts." |
*
* @param {Admin_Templates_Segment_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_segment_hint = /** @type {((inputs?: Admin_Templates_Segment_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Segment_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_segment_hint(inputs)
	return es_admin_templates_segment_hint(inputs)
});