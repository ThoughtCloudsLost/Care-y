/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_Text_PlaceholderInputs */

const en_admin_templates_text_placeholder = /** @type {(inputs: Admin_Templates_Text_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the template text...`)
};

const es_admin_templates_text_placeholder = /** @type {(inputs: Admin_Templates_Text_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa el texto de la plantilla...`)
};

const en_xa2_admin_templates_text_placeholder = /** @type {(inputs: Admin_Templates_Text_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr thè tèmplàtè tèxt... ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter the template text..." |
*
* @param {Admin_Templates_Text_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_text_placeholder = /** @type {((inputs?: Admin_Templates_Text_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Text_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_templates_text_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_admin_templates_text_placeholder(inputs)
	return en_admin_templates_text_placeholder(inputs)
});