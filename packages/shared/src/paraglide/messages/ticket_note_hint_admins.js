/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Note_Hint_AdminsInputs */

const en_ticket_note_hint_admins = /** @type {(inputs: Ticket_Note_Hint_AdminsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`admins`)
};

const es_ticket_note_hint_admins = /** @type {(inputs: Ticket_Note_Hint_AdminsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`administradores`)
};

const en_xa2_ticket_note_hint_admins = /** @type {(inputs: Ticket_Note_Hint_AdminsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦àdmìns ••⟧`)
};

/**
* | output |
* | --- |
* | "admins" |
*
* @param {Ticket_Note_Hint_AdminsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_note_hint_admins = /** @type {((inputs?: Ticket_Note_Hint_AdminsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_Hint_AdminsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_note_hint_admins(inputs)
	if (locale === "en-XA") return en_xa2_ticket_note_hint_admins(inputs)
	return en_ticket_note_hint_admins(inputs)
});