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

const en_xa2_admin_greetings_type_language_prompt_help = /** @type {(inputs: Admin_Greetings_Type_Language_Prompt_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Plàyèd whèn thè càllèr nèèds tò sèlèct à làngùàgè. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Played when the caller needs to select a language." |
*
* @param {Admin_Greetings_Type_Language_Prompt_HelpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_language_prompt_help = /** @type {((inputs?: Admin_Greetings_Type_Language_Prompt_HelpInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_Language_Prompt_HelpInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_type_language_prompt_help(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_type_language_prompt_help(inputs)
	return en_admin_greetings_type_language_prompt_help(inputs)
});