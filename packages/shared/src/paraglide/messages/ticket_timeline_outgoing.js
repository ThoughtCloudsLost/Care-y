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

const en_xa2_ticket_timeline_outgoing = /** @type {(inputs: Ticket_Timeline_OutgoingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} òùtgòìng •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} outgoing" |
*
* @param {Ticket_Timeline_OutgoingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_outgoing = /** @type {((inputs: Ticket_Timeline_OutgoingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_OutgoingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_timeline_outgoing(inputs)
	if (locale === "en-XA") return en_xa2_ticket_timeline_outgoing(inputs)
	return en_ticket_timeline_outgoing(inputs)
});