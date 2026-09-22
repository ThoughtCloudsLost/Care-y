/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Preferred_Language_SavedInputs */

const en_settings_preferred_language_saved = /** @type {(inputs: Settings_Preferred_Language_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preferred language updated`)
};

const es_settings_preferred_language_saved = /** @type {(inputs: Settings_Preferred_Language_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Idioma preferido actualizado`)
};

const en_xa2_settings_preferred_language_saved = /** @type {(inputs: Settings_Preferred_Language_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prèfèrrèd làngùàgè ùpdàtèd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Preferred language updated" |
*
* @param {Settings_Preferred_Language_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_preferred_language_saved = /** @type {((inputs?: Settings_Preferred_Language_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Preferred_Language_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_preferred_language_saved(inputs)
	if (locale === "en-XA") return en_xa2_settings_preferred_language_saved(inputs)
	return en_settings_preferred_language_saved(inputs)
});