/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ label: NonNullable<unknown>, time: NonNullable<unknown> }} Ticket_Timeline_Jump_ToInputs */

const en_ticket_timeline_jump_to = /** @type {(inputs: Ticket_Timeline_Jump_ToInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Jump to: ${i?.label}, ${i?.time}`)
};

const es_ticket_timeline_jump_to = /** @type {(inputs: Ticket_Timeline_Jump_ToInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ir a: ${i?.label}, ${i?.time}`)
};

/**
* | output |
* | --- |
* | "Jump to: {label}, {time}" |
*
* @param {Ticket_Timeline_Jump_ToInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_jump_to = /** @type {((inputs: Ticket_Timeline_Jump_ToInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_Jump_ToInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_timeline_jump_to(inputs)
	return es_ticket_timeline_jump_to(inputs)
});