/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_Reexport_EscrowInputs */

const en_admin_rotation_reexport_escrow = /** @type {(inputs: Admin_Rotation_Reexport_EscrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your recovery file predates this key. Export a new one to keep it current.`)
};

const es_admin_rotation_reexport_escrow = /** @type {(inputs: Admin_Rotation_Reexport_EscrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu archivo de recuperación es anterior a esta clave. Exporta uno nuevo para mantenerlo al día.`)
};

/**
* | output |
* | --- |
* | "Your recovery file predates this key. Export a new one to keep it current." |
*
* @param {Admin_Rotation_Reexport_EscrowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_reexport_escrow = /** @type {((inputs?: Admin_Rotation_Reexport_EscrowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_Reexport_EscrowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_reexport_escrow(inputs)
	return en_admin_rotation_reexport_escrow(inputs)
});