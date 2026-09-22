/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Persist_Language_DeclineInputs */

const en_settings_persist_language_decline = /** @type {(inputs: Settings_Persist_Language_DeclineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Not now`)
};

const es_settings_persist_language_decline = /** @type {(inputs: Settings_Persist_Language_DeclineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ahora no`)
};

const en_xa2_settings_persist_language_decline = /** @type {(inputs: Settings_Persist_Language_DeclineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòt nòw •••⟧`)
};

/**
* | output |
* | --- |
* | "Not now" |
*
* @param {Settings_Persist_Language_DeclineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_persist_language_decline = /** @type {((inputs?: Settings_Persist_Language_DeclineInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Persist_Language_DeclineInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_persist_language_decline(inputs)
	if (locale === "en-XA") return en_xa2_settings_persist_language_decline(inputs)
	return en_settings_persist_language_decline(inputs)
});