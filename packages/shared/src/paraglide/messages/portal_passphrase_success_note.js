/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Success_NoteInputs */

const en_portal_passphrase_success_note = /** @type {(inputs: Portal_Passphrase_Success_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If you lose the password, ask your support contact for a new link.`)
};

const es_portal_passphrase_success_note = /** @type {(inputs: Portal_Passphrase_Success_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si pierdes la contraseña, pide a tu contacto de apoyo un nuevo enlace.`)
};

const en_xa2_portal_passphrase_success_note = /** @type {(inputs: Portal_Passphrase_Success_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìf yòù lòsè thè pàsswòrd, àsk yòùr sùppòrt còntàct fòr à nèw lìnk. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "If you lose the password, ask your support contact for a new link." |
*
* @param {Portal_Passphrase_Success_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_success_note = /** @type {((inputs?: Portal_Passphrase_Success_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Success_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_success_note(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_success_note(inputs)
	return en_portal_passphrase_success_note(inputs)
});