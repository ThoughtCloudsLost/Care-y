/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_Export_EscrowInputs */

const en_admin_rotation_export_escrow = /** @type {(inputs: Admin_Rotation_Export_EscrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Export recovery file`)
};

const es_admin_rotation_export_escrow = /** @type {(inputs: Admin_Rotation_Export_EscrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exportar archivo de recuperación`)
};

/**
* | output |
* | --- |
* | "Export recovery file" |
*
* @param {Admin_Rotation_Export_EscrowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_export_escrow = /** @type {((inputs?: Admin_Rotation_Export_EscrowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_Export_EscrowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_export_escrow(inputs)
	return en_admin_rotation_export_escrow(inputs)
});