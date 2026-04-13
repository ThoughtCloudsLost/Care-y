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

/**
* | output |
* | --- |
* | "Note saved" |
*
* @param {Ticket_Note_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_saved = /** @type {((inputs?: Ticket_Note_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_note_saved(inputs)
	return es_ticket_note_saved(inputs)
});