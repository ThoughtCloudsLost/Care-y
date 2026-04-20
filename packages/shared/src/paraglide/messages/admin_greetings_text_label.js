/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Text_LabelInputs */

const en_admin_greetings_text_label = /** @type {(inputs: Admin_Greetings_Text_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Text`)
};

const es_admin_greetings_text_label = /** @type {(inputs: Admin_Greetings_Text_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto`)
};

/**
* | output |
* | --- |
* | "Text" |
*
* @param {Admin_Greetings_Text_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_text_label = /** @type {((inputs?: Admin_Greetings_Text_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Text_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_text_label(inputs)
	return es_admin_greetings_text_label(inputs)
});