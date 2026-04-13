/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Private_Note_Author_FallbackInputs */

const en_ticket_private_note_author_fallback = /** @type {(inputs: Ticket_Private_Note_Author_FallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note`)
};

const es_ticket_private_note_author_fallback = /** @type {(inputs: Ticket_Private_Note_Author_FallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nota`)
};

/**
* | output |
* | --- |
* | "Note" |
*
* @param {Ticket_Private_Note_Author_FallbackInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_private_note_author_fallback = /** @type {((inputs?: Ticket_Private_Note_Author_FallbackInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Private_Note_Author_FallbackInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_private_note_author_fallback(inputs)
	return es_ticket_private_note_author_fallback(inputs)
});