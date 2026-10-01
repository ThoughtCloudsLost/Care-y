/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_Currency_PlaceholderInputs */

const en_admin_funds_currency_placeholder = /** @type {(inputs: Admin_Funds_Currency_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`USD`)
};

const es_admin_funds_currency_placeholder = /** @type {(inputs: Admin_Funds_Currency_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`USD`)
};

const en_xa2_admin_funds_currency_placeholder = /** @type {(inputs: Admin_Funds_Currency_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ÙSD •⟧`)
};

/**
* | output |
* | --- |
* | "USD" |
*
* @param {Admin_Funds_Currency_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_currency_placeholder = /** @type {((inputs?: Admin_Funds_Currency_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_Currency_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_currency_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_currency_placeholder(inputs)
	return en_admin_funds_currency_placeholder(inputs)
});