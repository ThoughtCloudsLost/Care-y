/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Timeline_IncomingInputs */

const en_ticket_timeline_incoming = /** @type {(inputs: Ticket_Timeline_IncomingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} incoming`)
};

const es_ticket_timeline_incoming = /** @type {(inputs: Ticket_Timeline_IncomingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} entrantes`)
};

const en_xa2_ticket_timeline_incoming = /** @type {(inputs: Ticket_Timeline_IncomingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} ìncòmìng •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} incoming" |
*
* @param {Ticket_Timeline_IncomingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_incoming = /** @type {((inputs: Ticket_Timeline_IncomingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_IncomingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_timeline_incoming(inputs)
	if (locale === "en-XA") return en_xa2_ticket_timeline_incoming(inputs)
	return en_ticket_timeline_incoming(inputs)
});