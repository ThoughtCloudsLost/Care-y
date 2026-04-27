/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_ErrorInputs */

const en_admin_escrow_error = /** @type {(inputs: Admin_Escrow_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Export failed`)
};

const es_admin_escrow_error = /** @type {(inputs: Admin_Escrow_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La exportacion fallo`)
};

/**
* | output |
* | --- |
* | "Export failed" |
*
* @param {Admin_Escrow_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_error = /** @type {((inputs?: Admin_Escrow_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_error(inputs)
	return es_admin_escrow_error(inputs)
});