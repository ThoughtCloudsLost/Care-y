/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Passphrase_MismatchInputs */

const en_admin_escrow_passphrase_mismatch = /** @type {(inputs: Admin_Escrow_Passphrase_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passphrases don't match`)
};

const es_admin_escrow_passphrase_mismatch = /** @type {(inputs: Admin_Escrow_Passphrase_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las frases de contraseña no coinciden`)
};

const en_xa2_admin_escrow_passphrase_mismatch = /** @type {(inputs: Admin_Escrow_Passphrase_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàssphràsès dòn't màtch •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Passphrases don't match" |
*
* @param {Admin_Escrow_Passphrase_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_passphrase_mismatch = /** @type {((inputs?: Admin_Escrow_Passphrase_MismatchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Passphrase_MismatchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_passphrase_mismatch(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_passphrase_mismatch(inputs)
	return en_admin_escrow_passphrase_mismatch(inputs)
});