/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Passphrase_LabelInputs */

const en_admin_escrow_passphrase_label = /** @type {(inputs: Admin_Escrow_Passphrase_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passphrase`)
};

const es_admin_escrow_passphrase_label = /** @type {(inputs: Admin_Escrow_Passphrase_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Frase de contraseña`)
};

const en_xa2_admin_escrow_passphrase_label = /** @type {(inputs: Admin_Escrow_Passphrase_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàssphràsè •••⟧`)
};

/**
* | output |
* | --- |
* | "Passphrase" |
*
* @param {Admin_Escrow_Passphrase_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_passphrase_label = /** @type {((inputs?: Admin_Escrow_Passphrase_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Passphrase_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_passphrase_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_passphrase_label(inputs)
	return en_admin_escrow_passphrase_label(inputs)
});