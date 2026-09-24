/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Type_Language_PromptInputs */

const en_admin_greetings_type_language_prompt = /** @type {(inputs: Admin_Greetings_Type_Language_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Language selection`)
};

const es_admin_greetings_type_language_prompt = /** @type {(inputs: Admin_Greetings_Type_Language_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selección de idioma`)
};

const en_xa2_admin_greetings_type_language_prompt = /** @type {(inputs: Admin_Greetings_Type_Language_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Làngùàgè sèlèctìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Language selection" |
*
* @param {Admin_Greetings_Type_Language_PromptInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_language_prompt = /** @type {((inputs?: Admin_Greetings_Type_Language_PromptInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_Language_PromptInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_type_language_prompt(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_type_language_prompt(inputs)
	return en_admin_greetings_type_language_prompt(inputs)
});