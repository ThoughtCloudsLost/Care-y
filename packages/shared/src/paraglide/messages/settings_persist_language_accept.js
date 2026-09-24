/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Persist_Language_AcceptInputs */

const en_settings_persist_language_accept = /** @type {(inputs: Settings_Persist_Language_AcceptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save`)
};

const es_settings_persist_language_accept = /** @type {(inputs: Settings_Persist_Language_AcceptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar`)
};

const en_xa2_settings_persist_language_accept = /** @type {(inputs: Settings_Persist_Language_AcceptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè ••⟧`)
};

/**
* | output |
* | --- |
* | "Save" |
*
* @param {Settings_Persist_Language_AcceptInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_persist_language_accept = /** @type {((inputs?: Settings_Persist_Language_AcceptInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Persist_Language_AcceptInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_persist_language_accept(inputs)
	if (locale === "en-XA") return en_xa2_settings_persist_language_accept(inputs)
	return en_settings_persist_language_accept(inputs)
});