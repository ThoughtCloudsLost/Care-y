/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Export_ButtonInputs */

const en_admin_escrow_export_button = /** @type {(inputs: Admin_Escrow_Export_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Escrow File`)
};

const es_admin_escrow_export_button = /** @type {(inputs: Admin_Escrow_Export_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear archivo de custodia`)
};

/**
* | output |
* | --- |
* | "Create Escrow File" |
*
* @param {Admin_Escrow_Export_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_export_button = /** @type {((inputs?: Admin_Escrow_Export_ButtonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Export_ButtonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_export_button(inputs)
	return es_admin_escrow_export_button(inputs)
});