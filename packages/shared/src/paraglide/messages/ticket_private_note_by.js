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

const en_xa2_ticket_private_note_by = /** @type {(inputs: Ticket_Private_Note_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Prìvàtè nòtè by  •••••${i?.author}⟧`)
};

/**
* | output |
* | --- |
* | "Private note by {author}" |
*
* @param {Ticket_Private_Note_ByInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_private_note_by = /** @type {((inputs: Ticket_Private_Note_ByInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Private_Note_ByInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_private_note_by(inputs)
	if (locale === "en-XA") return en_xa2_ticket_private_note_by(inputs)
	return en_ticket_private_note_by(inputs)
});