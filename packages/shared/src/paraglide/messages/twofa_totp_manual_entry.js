/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Totp_Manual_EntryInputs */

const en_twofa_totp_manual_entry = /** @type {(inputs: Twofa_Totp_Manual_EntryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Or enter this code manually`)
};

const es_twofa_totp_manual_entry = /** @type {(inputs: Twofa_Totp_Manual_EntryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`O ingresa este código manualmente`)
};

const en_xa2_twofa_totp_manual_entry = /** @type {(inputs: Twofa_Totp_Manual_EntryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òr èntèr thìs còdè mànùàlly •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Or enter this code manually" |
*
* @param {Twofa_Totp_Manual_EntryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_manual_entry = /** @type {((inputs?: Twofa_Totp_Manual_EntryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Totp_Manual_EntryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_totp_manual_entry(inputs)
	if (locale === "en-XA") return en_xa2_twofa_totp_manual_entry(inputs)
	return en_twofa_totp_manual_entry(inputs)
});