/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, max: NonNullable<unknown> }} Ticket_Edit_Message_CounterInputs */

const en_ticket_edit_message_counter = /** @type {(inputs: Ticket_Edit_Message_CounterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} / ${i?.max}`)
};

const es_ticket_edit_message_counter = /** @type {(inputs: Ticket_Edit_Message_CounterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} / ${i?.max}`)
};

const en_xa2_ticket_edit_message_counter = /** @type {(inputs: Ticket_Edit_Message_CounterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} /  •${i?.max}⟧`)
};

/**
* | output |
* | --- |
* | "{count} / {max}" |
*
* @param {Ticket_Edit_Message_CounterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_message_counter = /** @type {((inputs: Ticket_Edit_Message_CounterInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Edit_Message_CounterInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_edit_message_counter(inputs)
	if (locale === "en-XA") return en_xa2_ticket_edit_message_counter(inputs)
	return en_ticket_edit_message_counter(inputs)
});