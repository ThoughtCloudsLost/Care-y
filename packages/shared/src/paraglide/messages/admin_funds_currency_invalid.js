/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_Currency_InvalidInputs */

const en_admin_funds_currency_invalid = /** @type {(inputs: Admin_Funds_Currency_InvalidInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a three-letter currency code.`)
};

const es_admin_funds_currency_invalid = /** @type {(inputs: Admin_Funds_Currency_InvalidInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe un código de moneda de tres letras.`)
};

const en_xa2_admin_funds_currency_invalid = /** @type {(inputs: Admin_Funds_Currency_InvalidInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr à thrèè-lèttèr cùrrèncy còdè. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter a three-letter currency code." |
*
* @param {Admin_Funds_Currency_InvalidInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_currency_invalid = /** @type {((inputs?: Admin_Funds_Currency_InvalidInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_Currency_InvalidInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_currency_invalid(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_currency_invalid(inputs)
	return en_admin_funds_currency_invalid(inputs)
});