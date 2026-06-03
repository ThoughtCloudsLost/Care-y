/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Ticket_Toast_UnassignedInputs */

const en_ticket_toast_unassigned = /** @type {(inputs: Ticket_Toast_UnassignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} unassigned`)
};

const es_ticket_toast_unassigned = /** @type {(inputs: Ticket_Toast_UnassignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} sin asignar`)
};

/**
* | output |
* | --- |
* | "{Ticket} unassigned" |
*
* @param {Ticket_Toast_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_unassigned = /** @type {((inputs: Ticket_Toast_UnassignedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_UnassignedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_toast_unassigned(inputs)
	return es_ticket_toast_unassigned(inputs)
});