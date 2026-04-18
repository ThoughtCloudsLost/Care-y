/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Passphrase_LabelInputs */

const en_admin_escrow_passphrase_label = /** @type {(inputs: Admin_Escrow_Passphrase_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passphrase`)
};

const es_admin_escrow_passphrase_label = /** @type {(inputs: Admin_Escrow_Passphrase_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Frase de contrasena`)
};

/**
* | output |
* | --- |
* | "Passphrase" |
*
* @param {Admin_Escrow_Passphrase_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_passphrase_label = /** @type {((inputs?: Admin_Escrow_Passphrase_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Passphrase_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_passphrase_label(inputs)
	return es_admin_escrow_passphrase_label(inputs)
});