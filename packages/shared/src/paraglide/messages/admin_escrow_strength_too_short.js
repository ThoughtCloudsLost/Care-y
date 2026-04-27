/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Strength_Too_ShortInputs */

const en_admin_escrow_strength_too_short = /** @type {(inputs: Admin_Escrow_Strength_Too_ShortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Too short (minimum 20 characters)`)
};

const es_admin_escrow_strength_too_short = /** @type {(inputs: Admin_Escrow_Strength_Too_ShortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Muy corta (minimo 20 caracteres)`)
};

/**
* | output |
* | --- |
* | "Too short (minimum 20 characters)" |
*
* @param {Admin_Escrow_Strength_Too_ShortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_strength_too_short = /** @type {((inputs?: Admin_Escrow_Strength_Too_ShortInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Strength_Too_ShortInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_strength_too_short(inputs)
	return es_admin_escrow_strength_too_short(inputs)
});