/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Preferred_LanguageInputs */

const en_settings_preferred_language = /** @type {(inputs: Settings_Preferred_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preferred language`)
};

const es_settings_preferred_language = /** @type {(inputs: Settings_Preferred_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Idioma preferido`)
};

const en_xa2_settings_preferred_language = /** @type {(inputs: Settings_Preferred_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prèfèrrèd làngùàgè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Preferred language" |
*
* @param {Settings_Preferred_LanguageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_preferred_language = /** @type {((inputs?: Settings_Preferred_LanguageInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Preferred_LanguageInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_preferred_language(inputs)
	if (locale === "en-XA") return en_xa2_settings_preferred_language(inputs)
	return en_settings_preferred_language(inputs)
});