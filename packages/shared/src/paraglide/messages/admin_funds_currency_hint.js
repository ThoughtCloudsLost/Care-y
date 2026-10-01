/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_Currency_HintInputs */

const en_admin_funds_currency_hint = /** @type {(inputs: Admin_Funds_Currency_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Three-letter code, such as USD, EUR or MXN.`)
};

const es_admin_funds_currency_hint = /** @type {(inputs: Admin_Funds_Currency_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Código de tres letras, como USD, EUR o MXN.`)
};

const en_xa2_admin_funds_currency_hint = /** @type {(inputs: Admin_Funds_Currency_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thrèè-lèttèr còdè, sùch às ÙSD, ÈÙR òr MXN. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Three-letter code, such as USD, EUR or MXN." |
*
* @param {Admin_Funds_Currency_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_currency_hint = /** @type {((inputs?: Admin_Funds_Currency_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_Currency_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_currency_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_currency_hint(inputs)
	return en_admin_funds_currency_hint(inputs)
});