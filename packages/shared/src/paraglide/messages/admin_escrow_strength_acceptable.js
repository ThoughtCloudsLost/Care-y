/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Strength_AcceptableInputs */

const en_admin_escrow_strength_acceptable = /** @type {(inputs: Admin_Escrow_Strength_AcceptableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acceptable`)
};

const es_admin_escrow_strength_acceptable = /** @type {(inputs: Admin_Escrow_Strength_AcceptableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aceptable`)
};

/**
* | output |
* | --- |
* | "Acceptable" |
*
* @param {Admin_Escrow_Strength_AcceptableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_strength_acceptable = /** @type {((inputs?: Admin_Escrow_Strength_AcceptableInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Strength_AcceptableInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_strength_acceptable(inputs)
	return es_admin_escrow_strength_acceptable(inputs)
});