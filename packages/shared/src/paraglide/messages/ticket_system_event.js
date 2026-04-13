/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_System_EventInputs */

const en_ticket_system_event = /** @type {(inputs: Ticket_System_EventInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`System event`)
};

const es_ticket_system_event = /** @type {(inputs: Ticket_System_EventInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Evento del sistema`)
};

/**
* | output |
* | --- |
* | "System event" |
*
* @param {Ticket_System_EventInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_event = /** @type {((inputs?: Ticket_System_EventInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_EventInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_system_event(inputs)
	return es_ticket_system_event(inputs)
});