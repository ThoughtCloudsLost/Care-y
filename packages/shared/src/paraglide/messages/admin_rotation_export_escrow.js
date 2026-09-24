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

const en_xa2_admin_rotation_export_escrow = /** @type {(inputs: Admin_Rotation_Export_EscrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxpòrt rècòvèry fìlè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Export recovery file" |
*
* @param {Admin_Rotation_Export_EscrowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_export_escrow = /** @type {((inputs?: Admin_Rotation_Export_EscrowInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_Export_EscrowInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_export_escrow(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_export_escrow(inputs)
	return en_admin_rotation_export_escrow(inputs)
});