/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ author: NonNullable<unknown> }} Ticket_Private_Note_ByInputs */

const en_ticket_private_note_by = /** @type {(inputs: Ticket_Private_Note_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Private note by ${i?.author}`)
};

const es_ticket_private_note_by = /** @type {(inputs: Ticket_Private_Note_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Nota privada de ${i?.author}`)
};

/**
* | output |
* | --- |
* | "Private note by {author}" |
*
* @param {Ticket_Private_Note_ByInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_private_note_by = /** @type {((inputs: Ticket_Private_Note_ByInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Private_Note_ByInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_private_note_by(inputs)
	return es_ticket_private_note_by(inputs)
});