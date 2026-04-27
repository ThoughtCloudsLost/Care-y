/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ targets: NonNullable<unknown> }} Ticket_Note_NotifiesInputs */

const en_ticket_note_notifies = /** @type {(inputs: Ticket_Note_NotifiesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Notifies ${i?.targets}`)
};

const es_ticket_note_notifies = /** @type {(inputs: Ticket_Note_NotifiesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Notifica a ${i?.targets}`)
};

/**
* | output |
* | --- |
* | "Notifies {targets}" |
*
* @param {Ticket_Note_NotifiesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_notifies = /** @type {((inputs: Ticket_Note_NotifiesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_NotifiesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_note_notifies(inputs)
	return es_ticket_note_notifies(inputs)
});