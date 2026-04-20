/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Type_Language_Prompt_HelpInputs */

const en_admin_greetings_type_language_prompt_help = /** @type {(inputs: Admin_Greetings_Type_Language_Prompt_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Played when the caller needs to select a language.`)
};

const es_admin_greetings_type_language_prompt_help = /** @type {(inputs: Admin_Greetings_Type_Language_Prompt_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se reproduce cuando la persona necesita seleccionar un idioma.`)
};

/**
* | output |
* | --- |
* | "Played when the caller needs to select a language." |
*
* @param {Admin_Greetings_Type_Language_Prompt_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_language_prompt_help = /** @type {((inputs?: Admin_Greetings_Type_Language_Prompt_HelpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_Language_Prompt_HelpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_type_language_prompt_help(inputs)
	return es_admin_greetings_type_language_prompt_help(inputs)
});