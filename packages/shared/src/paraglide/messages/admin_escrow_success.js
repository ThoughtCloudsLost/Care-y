/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_SuccessInputs */

const en_admin_escrow_success = /** @type {(inputs: Admin_Escrow_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escrow file exported`)
};

const es_admin_escrow_success = /** @type {(inputs: Admin_Escrow_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Archivo de custodia exportado`)
};

/**
* | output |
* | --- |
* | "Escrow file exported" |
*
* @param {Admin_Escrow_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_success = /** @type {((inputs?: Admin_Escrow_SuccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_SuccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_success(inputs)
	return es_admin_escrow_success(inputs)
});