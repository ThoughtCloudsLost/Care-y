/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Totp_Code_PlaceholderInputs */

const en_twofa_totp_code_placeholder = /** @type {(inputs: Twofa_Totp_Code_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`000000`)
};

const es_twofa_totp_code_placeholder = /** @type {(inputs: Twofa_Totp_Code_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`000000`)
};

const en_xa2_twofa_totp_code_placeholder = /** @type {(inputs: Twofa_Totp_Code_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦000000 ••⟧`)
};

/**
* | output |
* | --- |
* | "000000" |
*
* @param {Twofa_Totp_Code_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_code_placeholder = /** @type {((inputs?: Twofa_Totp_Code_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Totp_Code_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_totp_code_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_twofa_totp_code_placeholder(inputs)
	return en_twofa_totp_code_placeholder(inputs)
});