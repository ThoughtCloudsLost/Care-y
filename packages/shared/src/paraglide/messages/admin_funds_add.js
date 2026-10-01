/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_AddInputs */

const en_admin_funds_add = /** @type {(inputs: Admin_Funds_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add fund`)
};

const es_admin_funds_add = /** @type {(inputs: Admin_Funds_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Añadir fondo`)
};

const en_xa2_admin_funds_add = /** @type {(inputs: Admin_Funds_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd fùnd •••⟧`)
};

/**
* | output |
* | --- |
* | "Add fund" |
*
* @param {Admin_Funds_AddInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_add = /** @type {((inputs?: Admin_Funds_AddInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_AddInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_add(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_add(inputs)
	return en_admin_funds_add(inputs)
});