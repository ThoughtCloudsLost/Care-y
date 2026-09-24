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

const en_xa2_ticket_timeline_messages_count = /** @type {(inputs: Ticket_Timeline_Messages_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} mèssàgès •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} messages" |
*
* @param {Ticket_Timeline_Messages_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_messages_count = /** @type {((inputs: Ticket_Timeline_Messages_CountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_Messages_CountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_timeline_messages_count(inputs)
	if (locale === "en-XA") return en_xa2_ticket_timeline_messages_count(inputs)
	return en_ticket_timeline_messages_count(inputs)
});