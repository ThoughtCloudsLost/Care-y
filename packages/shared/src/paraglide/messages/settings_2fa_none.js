/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_2fa_NoneInputs */

const en_settings_2fa_none = /** @type {(inputs: Settings_2fa_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Not enabled`)
};

const es_settings_2fa_none = /** @type {(inputs: Settings_2fa_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No habilitada`)
};

const en_xa2_settings_2fa_none = /** @type {(inputs: Settings_2fa_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòt ènàblèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Not enabled" |
*
* @param {Settings_2fa_NoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_2fa_none = /** @type {((inputs?: Settings_2fa_NoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_2fa_NoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_2fa_none(inputs)
	if (locale === "en-XA") return en_xa2_settings_2fa_none(inputs)
	return en_settings_2fa_none(inputs)
});