/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Confirm_LabelInputs */

const en_admin_escrow_confirm_label = /** @type {(inputs: Admin_Escrow_Confirm_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm passphrase`)
};

const es_admin_escrow_confirm_label = /** @type {(inputs: Admin_Escrow_Confirm_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar frase de contrasena`)
};

/**
* | output |
* | --- |
* | "Confirm passphrase" |
*
* @param {Admin_Escrow_Confirm_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_confirm_label = /** @type {((inputs?: Admin_Escrow_Confirm_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Confirm_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_confirm_label(inputs)
	return es_admin_escrow_confirm_label(inputs)
});