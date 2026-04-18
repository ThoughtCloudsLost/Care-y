/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Strength_StrongInputs */

const en_admin_escrow_strength_strong = /** @type {(inputs: Admin_Escrow_Strength_StrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Strong`)
};

const es_admin_escrow_strength_strong = /** @type {(inputs: Admin_Escrow_Strength_StrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fuerte`)
};

/**
* | output |
* | --- |
* | "Strong" |
*
* @param {Admin_Escrow_Strength_StrongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_strength_strong = /** @type {((inputs?: Admin_Escrow_Strength_StrongInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Strength_StrongInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_strength_strong(inputs)
	return es_admin_escrow_strength_strong(inputs)
});