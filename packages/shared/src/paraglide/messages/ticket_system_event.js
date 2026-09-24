/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_System_EventInputs */

const en_ticket_system_event = /** @type {(inputs: Ticket_System_EventInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Event`)
};

const es_ticket_system_event = /** @type {(inputs: Ticket_System_EventInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Evento`)
};

const en_xa2_ticket_system_event = /** @type {(inputs: Ticket_System_EventInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èvènt ••⟧`)
};

/**
* | output |
* | --- |
* | "Event" |
*
* @param {Ticket_System_EventInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_event = /** @type {((inputs?: Ticket_System_EventInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_EventInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_system_event(inputs)
	if (locale === "en-XA") return en_xa2_ticket_system_event(inputs)
	return en_ticket_system_event(inputs)
});