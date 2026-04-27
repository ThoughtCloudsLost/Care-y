/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_ExportingInputs */

const en_admin_escrow_exporting = /** @type {(inputs: Admin_Escrow_ExportingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creating escrow file...`)
};

const es_admin_escrow_exporting = /** @type {(inputs: Admin_Escrow_ExportingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creando archivo de custodia...`)
};

/**
* | output |
* | --- |
* | "Creating escrow file..." |
*
* @param {Admin_Escrow_ExportingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_exporting = /** @type {((inputs?: Admin_Escrow_ExportingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_ExportingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_exporting(inputs)
	return es_admin_escrow_exporting(inputs)
});