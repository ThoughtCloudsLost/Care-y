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

const en_xa2_admin_escrow_exporting = /** @type {(inputs: Admin_Escrow_ExportingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtìng èscròw fìlè... •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Creating escrow file..." |
*
* @param {Admin_Escrow_ExportingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_exporting = /** @type {((inputs?: Admin_Escrow_ExportingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_ExportingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_exporting(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_exporting(inputs)
	return en_admin_escrow_exporting(inputs)
});