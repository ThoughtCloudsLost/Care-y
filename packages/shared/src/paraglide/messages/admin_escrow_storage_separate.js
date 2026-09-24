/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Storage_SeparateInputs */

const en_admin_escrow_storage_separate = /** @type {(inputs: Admin_Escrow_Storage_SeparateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Write the passphrase down separately from the USB`)
};

const es_admin_escrow_storage_separate = /** @type {(inputs: Admin_Escrow_Storage_SeparateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escriba la frase de contraseña por separado de la USB`)
};

const en_xa2_admin_escrow_storage_separate = /** @type {(inputs: Admin_Escrow_Storage_SeparateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wrìtè thè pàssphràsè dòwn sèpàràtèly fròm thè ÙSB •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Write the passphrase down separately from the USB" |
*
* @param {Admin_Escrow_Storage_SeparateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_storage_separate = /** @type {((inputs?: Admin_Escrow_Storage_SeparateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Storage_SeparateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_storage_separate(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_storage_separate(inputs)
	return en_admin_escrow_storage_separate(inputs)
});