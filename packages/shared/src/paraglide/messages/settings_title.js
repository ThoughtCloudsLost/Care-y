/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_TitleInputs */

const en_settings_title = /** @type {(inputs: Settings_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Settings`)
};

const es_settings_title = /** @type {(inputs: Settings_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuracion`)
};

/**
* | output |
* | --- |
* | "Settings" |
*
* @param {Settings_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_title = /** @type {((inputs?: Settings_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_title(inputs)
	return es_settings_title(inputs)
});