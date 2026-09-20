/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Storage_UsbInputs */

const en_admin_escrow_storage_usb = /** @type {(inputs: Admin_Escrow_Storage_UsbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save to a USB drive, not your computer or cloud storage`)
};

const es_admin_escrow_storage_usb = /** @type {(inputs: Admin_Escrow_Storage_UsbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardelo en una unidad USB, no en su computadora o almacenamiento en la nube`)
};

const en_xa2_admin_escrow_storage_usb = /** @type {(inputs: Admin_Escrow_Storage_UsbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè tò à ÙSB drìvè, nòt yòùr còmpùtèr òr clòùd stòràgè •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Save to a USB drive, not your computer or cloud storage" |
*
* @param {Admin_Escrow_Storage_UsbInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_storage_usb = /** @type {((inputs?: Admin_Escrow_Storage_UsbInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Storage_UsbInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_storage_usb(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_storage_usb(inputs)
	return en_admin_escrow_storage_usb(inputs)
});