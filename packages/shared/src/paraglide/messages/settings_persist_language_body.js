/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Persist_Language_BodyInputs */

const en_settings_persist_language_body = /** @type {(inputs: Settings_Persist_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Would you like to save this as your preferred language? The app will use this language at sign in.`)
};

const es_settings_persist_language_body = /** @type {(inputs: Settings_Persist_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Deseas guardar este idioma como tu preferencia? Al iniciar sesión, la app usará este idioma.`)
};

const en_xa2_settings_persist_language_body = /** @type {(inputs: Settings_Persist_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wòùld yòù lìkè tò sàvè thìs às yòùr prèfèrrèd làngùàgè? Thè àpp wìll ùsè thìs làngùàgè àt sìgn ìn. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Would you like to save this as your preferred language? The app will use this language at sign in." |
*
* @param {Settings_Persist_Language_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_persist_language_body = /** @type {((inputs?: Settings_Persist_Language_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Persist_Language_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_persist_language_body(inputs)
	if (locale === "en-XA") return en_xa2_settings_persist_language_body(inputs)
	return en_settings_persist_language_body(inputs)
});