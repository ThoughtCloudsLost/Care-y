/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Strength_GoodInputs */

const en_admin_escrow_strength_good = /** @type {(inputs: Admin_Escrow_Strength_GoodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Good`)
};

const es_admin_escrow_strength_good = /** @type {(inputs: Admin_Escrow_Strength_GoodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buena`)
};

/**
* | output |
* | --- |
* | "Good" |
*
* @param {Admin_Escrow_Strength_GoodInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_strength_good = /** @type {((inputs?: Admin_Escrow_Strength_GoodInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Strength_GoodInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_strength_good(inputs)
	return es_admin_escrow_strength_good(inputs)
});