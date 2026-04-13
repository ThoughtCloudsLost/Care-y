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

/**
* | output |
* | --- |
* | "{count} incoming" |
*
* @param {Ticket_Timeline_IncomingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_incoming = /** @type {((inputs: Ticket_Timeline_IncomingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_IncomingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_timeline_incoming(inputs)
	return es_ticket_timeline_incoming(inputs)
});