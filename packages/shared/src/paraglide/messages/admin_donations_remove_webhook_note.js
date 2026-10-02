/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_Remove_Webhook_NoteInputs */

const en_admin_donations_remove_webhook_note = /** @type {(inputs: Admin_Donations_Remove_Webhook_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Removing also tries to delete the webhook at Givebutter. If the webhook still appears in your Givebutter dashboard, delete it there.`)
};

const es_admin_donations_remove_webhook_note = /** @type {(inputs: Admin_Donations_Remove_Webhook_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Al quitarla también se intenta borrar el webhook en Givebutter. Si el webhook sigue apareciendo en tu panel de Givebutter, bórralo allí.`)
};

const en_xa2_admin_donations_remove_webhook_note = /** @type {(inputs: Admin_Donations_Remove_Webhook_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvìng àlsò trìès tò dèlètè thè wèbhòòk àt Gìvèbùttèr. Ìf thè wèbhòòk stìll àppèàrs ìn yòùr Gìvèbùttèr dàshbòàrd, dèlètè ìt thèrè. ••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Removing also tries to delete the webhook at Givebutter. If the webhook still appears in your Givebutter dashboard, delete it there." |
*
* @param {Admin_Donations_Remove_Webhook_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_remove_webhook_note = /** @type {((inputs?: Admin_Donations_Remove_Webhook_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_Remove_Webhook_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_remove_webhook_note(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_remove_webhook_note(inputs)
	return en_admin_donations_remove_webhook_note(inputs)
});