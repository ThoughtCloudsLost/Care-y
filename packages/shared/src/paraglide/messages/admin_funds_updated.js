/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_UpdatedInputs */

const en_admin_funds_updated = /** @type {(inputs: Admin_Funds_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fund updated`)
};

const es_admin_funds_updated = /** @type {(inputs: Admin_Funds_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fondo actualizado`)
};

const en_xa2_admin_funds_updated = /** @type {(inputs: Admin_Funds_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnd ùpdàtèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Fund updated" |
*
* @param {Admin_Funds_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_updated = /** @type {((inputs?: Admin_Funds_UpdatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_UpdatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_updated(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_updated(inputs)
	return en_admin_funds_updated(inputs)
});