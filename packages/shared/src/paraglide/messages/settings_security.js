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

const en_xa2_settings_security = /** @type {(inputs: Settings_SecurityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècùrìty •••⟧`)
};

/**
* | output |
* | --- |
* | "Security" |
*
* @param {Settings_SecurityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_security = /** @type {((inputs?: Settings_SecurityInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_SecurityInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_security(inputs)
	if (locale === "en-XA") return en_xa2_settings_security(inputs)
	return en_settings_security(inputs)
});