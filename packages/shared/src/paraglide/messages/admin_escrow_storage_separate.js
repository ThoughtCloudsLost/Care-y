/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Storage_SeparateInputs */

const en_admin_escrow_storage_separate = /** @type {(inputs: Admin_Escrow_Storage_SeparateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Write the passphrase down separately from the USB`)
};

const es_admin_escrow_storage_separate = /** @type {(inputs: Admin_Escrow_Storage_SeparateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escriba la frase de contrasena por separado de la USB`)
};

/**
* | output |
* | --- |
* | "Write the passphrase down separately from the USB" |
*
* @param {Admin_Escrow_Storage_SeparateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_storage_separate = /** @type {((inputs?: Admin_Escrow_Storage_SeparateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Storage_SeparateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_storage_separate(inputs)
	return es_admin_escrow_storage_separate(inputs)
});