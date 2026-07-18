/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ label: NonNullable<unknown>, count: NonNullable<unknown> }} Ticket_System_Event_GroupedInputs */

const en_ticket_system_event_grouped = /** @type {(inputs: Ticket_System_Event_GroupedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.label} (${i?.count})`)
};

const es_ticket_system_event_grouped = /** @type {(inputs: Ticket_System_Event_GroupedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.label} (${i?.count})`)
};

/**
* | output |
* | --- |
* | "{label} ({count})" |
*
* @param {Ticket_System_Event_GroupedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_event_grouped = /** @type {((inputs: Ticket_System_Event_GroupedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Event_GroupedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_system_event_grouped(inputs)
	return es_ticket_system_event_grouped(inputs)
});