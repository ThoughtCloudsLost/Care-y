/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Text_PlaceholderInputs */

const en_admin_greetings_text_placeholder = /** @type {(inputs: Admin_Greetings_Text_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the greeting text...`)
};

const es_admin_greetings_text_placeholder = /** @type {(inputs: Admin_Greetings_Text_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingrese el texto del saludo...`)
};

/**
* | output |
* | --- |
* | "Enter the greeting text..." |
*
* @param {Admin_Greetings_Text_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_text_placeholder = /** @type {((inputs?: Admin_Greetings_Text_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Text_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_text_placeholder(inputs)
	return es_admin_greetings_text_placeholder(inputs)
});