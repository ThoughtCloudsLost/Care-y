/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Storage_CopyInputs */

const en_admin_escrow_storage_copy = /** @type {(inputs: Admin_Escrow_Storage_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Give a copy to a trusted second person (board member, co-director)`)
};

const es_admin_escrow_storage_copy = /** @type {(inputs: Admin_Escrow_Storage_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`De una copia a una segunda persona de confianza (miembro de la junta, codirector)`)
};

const en_xa2_admin_escrow_storage_copy = /** @type {(inputs: Admin_Escrow_Storage_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gìvè à còpy tò à trùstèd sècònd pèrsòn (bòàrd mèmbèr, cò-dìrèctòr) ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Give a copy to a trusted second person (board member, co-director)" |
*
* @param {Admin_Escrow_Storage_CopyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_storage_copy = /** @type {((inputs?: Admin_Escrow_Storage_CopyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Storage_CopyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_storage_copy(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_storage_copy(inputs)
	return en_admin_escrow_storage_copy(inputs)
});