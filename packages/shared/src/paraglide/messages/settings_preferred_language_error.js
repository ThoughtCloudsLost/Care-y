/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Preferred_Language_ErrorInputs */

const en_settings_preferred_language_error = /** @type {(inputs: Settings_Preferred_Language_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not update preferred language`)
};

const es_settings_preferred_language_error = /** @type {(inputs: Settings_Preferred_Language_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo actualizar el idioma preferido`)
};

const en_xa2_settings_preferred_language_error = /** @type {(inputs: Settings_Preferred_Language_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt ùpdàtè prèfèrrèd làngùàgè •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not update preferred language" |
*
* @param {Settings_Preferred_Language_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_preferred_language_error = /** @type {((inputs?: Settings_Preferred_Language_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Preferred_Language_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_preferred_language_error(inputs)
	if (locale === "en-XA") return en_xa2_settings_preferred_language_error(inputs)
	return en_settings_preferred_language_error(inputs)
});