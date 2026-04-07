/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Mention_VolunteersInputs */

const en_ticket_mention_volunteers = /** @type {(inputs: Ticket_Mention_VolunteersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mention a volunteer`)
};

const es_ticket_mention_volunteers = /** @type {(inputs: Ticket_Mention_VolunteersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mencionar un voluntario`)
};

/**
* | output |
* | --- |
* | "Mention a volunteer" |
*
* @param {Ticket_Mention_VolunteersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_mention_volunteers = /** @type {((inputs?: Ticket_Mention_VolunteersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Mention_VolunteersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_mention_volunteers(inputs)
	return es_ticket_mention_volunteers(inputs)
});