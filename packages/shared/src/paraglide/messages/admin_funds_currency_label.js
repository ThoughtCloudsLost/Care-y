/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_Currency_LabelInputs */

const en_admin_funds_currency_label = /** @type {(inputs: Admin_Funds_Currency_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Currency`)
};

const es_admin_funds_currency_label = /** @type {(inputs: Admin_Funds_Currency_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Moneda`)
};

const en_xa2_admin_funds_currency_label = /** @type {(inputs: Admin_Funds_Currency_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cùrrèncy •••⟧`)
};

/**
* | output |
* | --- |
* | "Currency" |
*
* @param {Admin_Funds_Currency_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_currency_label = /** @type {((inputs?: Admin_Funds_Currency_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_Currency_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_currency_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_currency_label(inputs)
	return en_admin_funds_currency_label(inputs)
});