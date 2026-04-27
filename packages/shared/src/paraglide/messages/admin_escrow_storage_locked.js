/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Storage_LockedInputs */

const en_admin_escrow_storage_locked = /** @type {(inputs: Admin_Escrow_Storage_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Keep the USB in a locked location (safe, locked drawer)`)
};

const es_admin_escrow_storage_locked = /** @type {(inputs: Admin_Escrow_Storage_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mantenga la USB en un lugar cerrado con llave (caja fuerte, cajon con llave)`)
};

/**
* | output |
* | --- |
* | "Keep the USB in a locked location (safe, locked drawer)" |
*
* @param {Admin_Escrow_Storage_LockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_storage_locked = /** @type {((inputs?: Admin_Escrow_Storage_LockedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Storage_LockedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_storage_locked(inputs)
	return es_admin_escrow_storage_locked(inputs)
});