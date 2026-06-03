/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, tickets: NonNullable<unknown>, name: NonNullable<unknown> }} Ticket_Toast_Bulk_AssignedInputs */

const en_ticket_toast_bulk_assigned = /** @type {(inputs: Ticket_Toast_Bulk_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.tickets} assigned to ${i?.name}`)
};

const es_ticket_toast_bulk_assigned = /** @type {(inputs: Ticket_Toast_Bulk_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.tickets} asignados a ${i?.name}`)
};

/**
* | output |
* | --- |
* | "{count} {tickets} assigned to {name}" |
*
* @param {Ticket_Toast_Bulk_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_bulk_assigned = /** @type {((inputs: Ticket_Toast_Bulk_AssignedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Bulk_AssignedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_toast_bulk_assigned(inputs)
	return es_ticket_toast_bulk_assigned(inputs)
});