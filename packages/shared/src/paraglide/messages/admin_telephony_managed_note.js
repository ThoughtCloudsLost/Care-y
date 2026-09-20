/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Managed_NoteInputs */

const en_admin_telephony_managed_note = /** @type {(inputs: Admin_Telephony_Managed_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your phone service is managed for you. Contact your admin for changes.`)
};

const es_admin_telephony_managed_note = /** @type {(inputs: Admin_Telephony_Managed_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su servicio telefónico es gestionado por la plataforma. Contacte a su administrador para realizar cambios.`)
};

const en_xa2_admin_telephony_managed_note = /** @type {(inputs: Admin_Telephony_Managed_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr phònè sèrvìcè ìs mànàgèd fòr yòù. Còntàct yòùr àdmìn fòr chàngès. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your phone service is managed for you. Contact your admin for changes." |
*
* @param {Admin_Telephony_Managed_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_managed_note = /** @type {((inputs?: Admin_Telephony_Managed_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Managed_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_managed_note(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_managed_note(inputs)
	return en_admin_telephony_managed_note(inputs)
});