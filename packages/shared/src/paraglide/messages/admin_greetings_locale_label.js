/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Locale_LabelInputs */

const en_admin_greetings_locale_label = /** @type {(inputs: Admin_Greetings_Locale_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Language`)
};

const es_admin_greetings_locale_label = /** @type {(inputs: Admin_Greetings_Locale_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Idioma`)
};

const en_xa2_admin_greetings_locale_label = /** @type {(inputs: Admin_Greetings_Locale_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Làngùàgè •••⟧`)
};

/**
* | output |
* | --- |
* | "Language" |
*
* @param {Admin_Greetings_Locale_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_locale_label = /** @type {((inputs?: Admin_Greetings_Locale_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Locale_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_locale_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_locale_label(inputs)
	return en_admin_greetings_locale_label(inputs)
});