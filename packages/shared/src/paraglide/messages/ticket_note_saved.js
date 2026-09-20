/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Note_SavedInputs */

const en_ticket_note_saved = /** @type {(inputs: Ticket_Note_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note saved`)
};

const es_ticket_note_saved = /** @type {(inputs: Ticket_Note_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nota guardada`)
};

const en_xa2_ticket_note_saved = /** @type {(inputs: Ticket_Note_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtè sàvèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Note saved" |
*
* @param {Ticket_Note_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_note_saved = /** @type {((inputs?: Ticket_Note_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_note_saved(inputs)
	if (locale === "en-XA") return en_xa2_ticket_note_saved(inputs)
	return en_ticket_note_saved(inputs)
});