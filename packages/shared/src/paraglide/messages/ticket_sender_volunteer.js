/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Sender_VolunteerInputs */

const en_ticket_sender_volunteer = /** @type {(inputs: Ticket_Sender_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer`)
};

const es_ticket_sender_volunteer = /** @type {(inputs: Ticket_Sender_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voluntario`)
};

/**
* | output |
* | --- |
* | "Volunteer" |
*
* @param {Ticket_Sender_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sender_volunteer = /** @type {((inputs?: Ticket_Sender_VolunteerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Sender_VolunteerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_sender_volunteer(inputs)
	return es_ticket_sender_volunteer(inputs)
});