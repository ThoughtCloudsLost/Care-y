/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteer: NonNullable<unknown> }} Ticket_Mention_VolunteersInputs */

const en_ticket_mention_volunteers = /** @type {(inputs: Ticket_Mention_VolunteersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mention a ${i?.volunteer}`)
};

const es_ticket_mention_volunteers = /** @type {(inputs: Ticket_Mention_VolunteersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mencionar un ${i?.volunteer}`)
};

const en_xa2_ticket_mention_volunteers = /** @type {(inputs: Ticket_Mention_VolunteersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Mèntìòn à  •••${i?.volunteer}⟧`)
};

/**
* | output |
* | --- |
* | "Mention a {volunteer}" |
*
* @param {Ticket_Mention_VolunteersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_mention_volunteers = /** @type {((inputs: Ticket_Mention_VolunteersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Mention_VolunteersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_mention_volunteers(inputs)
	if (locale === "en-XA") return en_xa2_ticket_mention_volunteers(inputs)
	return en_ticket_mention_volunteers(inputs)
});