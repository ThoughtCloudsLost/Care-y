/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Storage_TestInputs */

const en_admin_escrow_storage_test = /** @type {(inputs: Admin_Escrow_Storage_TestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Test the file periodically: can you still find it and remember the passphrase?`)
};

const es_admin_escrow_storage_test = /** @type {(inputs: Admin_Escrow_Storage_TestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Pruebe el archivo periódicamente: puede encontrarlo y recordar la frase de contraseña?`)
};

const en_xa2_admin_escrow_storage_test = /** @type {(inputs: Admin_Escrow_Storage_TestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèst thè fìlè pèrìòdìcàlly: càn yòù stìll fìnd ìt ànd rèmèmbèr thè pàssphràsè? ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Test the file periodically: can you still find it and remember the passphrase?" |
*
* @param {Admin_Escrow_Storage_TestInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_storage_test = /** @type {((inputs?: Admin_Escrow_Storage_TestInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Storage_TestInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_storage_test(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_storage_test(inputs)
	return en_admin_escrow_storage_test(inputs)
});