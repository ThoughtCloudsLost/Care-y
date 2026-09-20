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

const en_xa2_admin_greetings_text_label = /** @type {(inputs: Admin_Greetings_Text_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèxt ••⟧`)
};

/**
* | output |
* | --- |
* | "Text" |
*
* @param {Admin_Greetings_Text_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_text_label = /** @type {((inputs?: Admin_Greetings_Text_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Text_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_text_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_text_label(inputs)
	return en_admin_greetings_text_label(inputs)
});