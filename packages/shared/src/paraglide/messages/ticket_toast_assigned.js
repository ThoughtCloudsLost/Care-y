/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Ticket_Toast_AssignedInputs */

const en_ticket_toast_assigned = /** @type {(inputs: Ticket_Toast_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Assigned to ${i?.name}`)
};

const es_ticket_toast_assigned = /** @type {(inputs: Ticket_Toast_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Asignado a ${i?.name}`)
};

/**
* | output |
* | --- |
* | "Assigned to {name}" |
*
* @param {Ticket_Toast_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_assigned = /** @type {((inputs: Ticket_Toast_AssignedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_AssignedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_toast_assigned(inputs)
	return es_ticket_toast_assigned(inputs)
});