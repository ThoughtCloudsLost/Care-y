/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Timeline_Messages_CountInputs */

const en_ticket_timeline_messages_count = /** @type {(inputs: Ticket_Timeline_Messages_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} messages`)
};

const es_ticket_timeline_messages_count = /** @type {(inputs: Ticket_Timeline_Messages_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} mensajes`)
};

/**
* | output |
* | --- |
* | "{count} messages" |
*
* @param {Ticket_Timeline_Messages_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_messages_count = /** @type {((inputs: Ticket_Timeline_Messages_CountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_Messages_CountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_timeline_messages_count(inputs)
	return es_ticket_timeline_messages_count(inputs)
});