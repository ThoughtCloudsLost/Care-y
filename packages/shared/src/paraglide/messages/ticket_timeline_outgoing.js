/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Timeline_OutgoingInputs */

const en_ticket_timeline_outgoing = /** @type {(inputs: Ticket_Timeline_OutgoingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} outgoing`)
};

const es_ticket_timeline_outgoing = /** @type {(inputs: Ticket_Timeline_OutgoingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} salientes`)
};

/**
* | output |
* | --- |
* | "{count} outgoing" |
*
* @param {Ticket_Timeline_OutgoingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_outgoing = /** @type {((inputs: Ticket_Timeline_OutgoingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_OutgoingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_timeline_outgoing(inputs)
	return es_ticket_timeline_outgoing(inputs)
});