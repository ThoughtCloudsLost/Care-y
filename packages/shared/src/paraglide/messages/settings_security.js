/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_SecurityInputs */

const en_settings_security = /** @type {(inputs: Settings_SecurityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Security`)
};

const es_settings_security = /** @type {(inputs: Settings_SecurityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seguridad`)
};

/**
* | output |
* | --- |
* | "Security" |
*
* @param {Settings_SecurityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_security = /** @type {((inputs?: Settings_SecurityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_SecurityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_security(inputs)
	return es_settings_security(inputs)
});