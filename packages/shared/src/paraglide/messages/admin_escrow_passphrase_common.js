/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Passphrase_CommonInputs */

const en_admin_escrow_passphrase_common = /** @type {(inputs: Admin_Escrow_Passphrase_CommonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This passphrase follows a predictable pattern. Use a more varied phrase.`)
};

const es_admin_escrow_passphrase_common = /** @type {(inputs: Admin_Escrow_Passphrase_CommonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta frase de contrasena sigue un patron predecible. Use una frase mas variada.`)
};

/**
* | output |
* | --- |
* | "This passphrase follows a predictable pattern. Use a more varied phrase." |
*
* @param {Admin_Escrow_Passphrase_CommonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_passphrase_common = /** @type {((inputs?: Admin_Escrow_Passphrase_CommonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Passphrase_CommonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_passphrase_common(inputs)
	return es_admin_escrow_passphrase_common(inputs)
});