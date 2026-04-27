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

/**
* | output |
* | --- |
* | "admins" |
*
* @param {Ticket_Note_Hint_AdminsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_hint_admins = /** @type {((inputs?: Ticket_Note_Hint_AdminsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_Hint_AdminsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_note_hint_admins(inputs)
	return es_ticket_note_hint_admins(inputs)
});