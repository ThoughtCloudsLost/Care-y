/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Persist_Language_TitleInputs */

const en_settings_persist_language_title = /** @type {(inputs: Settings_Persist_Language_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save language preference?`)
};

const es_settings_persist_language_title = /** @type {(inputs: Settings_Persist_Language_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Guardar preferencia de idioma?`)
};

const en_xa2_settings_persist_language_title = /** @type {(inputs: Settings_Persist_Language_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè làngùàgè prèfèrèncè? ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Save language preference?" |
*
* @param {Settings_Persist_Language_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_persist_language_title = /** @type {((inputs?: Settings_Persist_Language_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Persist_Language_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_persist_language_title(inputs)
	if (locale === "en-XA") return en_xa2_settings_persist_language_title(inputs)
	return en_settings_persist_language_title(inputs)
});