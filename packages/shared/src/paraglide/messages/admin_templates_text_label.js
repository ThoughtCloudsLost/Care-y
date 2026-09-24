/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_Text_LabelInputs */

const en_admin_templates_text_label = /** @type {(inputs: Admin_Templates_Text_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Message text`)
};

const es_admin_templates_text_label = /** @type {(inputs: Admin_Templates_Text_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto del mensaje`)
};

const en_xa2_admin_templates_text_label = /** @type {(inputs: Admin_Templates_Text_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèssàgè tèxt ••••⟧`)
};

/**
* | output |
* | --- |
* | "Message text" |
*
* @param {Admin_Templates_Text_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_text_label = /** @type {((inputs?: Admin_Templates_Text_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Text_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_templates_text_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_templates_text_label(inputs)
	return en_admin_templates_text_label(inputs)
});