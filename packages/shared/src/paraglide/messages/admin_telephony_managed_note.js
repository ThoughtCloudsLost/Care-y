/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Managed_NoteInputs */

const en_admin_telephony_managed_note = /** @type {(inputs: Admin_Telephony_Managed_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your phone service is managed for you. Contact your admin for changes.`)
};

const es_admin_telephony_managed_note = /** @type {(inputs: Admin_Telephony_Managed_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su servicio telefonico es gestionado por la plataforma. Contacte a su administrador para realizar cambios.`)
};

/**
* | output |
* | --- |
* | "Your phone service is managed for you. Contact your admin for changes." |
*
* @param {Admin_Telephony_Managed_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_managed_note = /** @type {((inputs?: Admin_Telephony_Managed_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Managed_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_managed_note(inputs)
	return es_admin_telephony_managed_note(inputs)
});