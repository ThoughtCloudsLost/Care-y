/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Preferred_Language_NoneInputs */

const en_settings_preferred_language_none = /** @type {(inputs: Settings_Preferred_Language_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Not set`)
};

const es_settings_preferred_language_none = /** @type {(inputs: Settings_Preferred_Language_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No establecido`)
};

const en_xa2_settings_preferred_language_none = /** @type {(inputs: Settings_Preferred_Language_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòt sèt •••⟧`)
};

/**
* | output |
* | --- |
* | "Not set" |
*
* @param {Settings_Preferred_Language_NoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_preferred_language_none = /** @type {((inputs?: Settings_Preferred_Language_NoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Preferred_Language_NoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_preferred_language_none(inputs)
	if (locale === "en-XA") return en_xa2_settings_preferred_language_none(inputs)
	return en_settings_preferred_language_none(inputs)
});