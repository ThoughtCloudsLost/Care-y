/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown>, client: NonNullable<unknown> }} Error_Ticket_Create_Target_ChangedInputs */

const en_error_ticket_create_target_changed = /** @type {(inputs: Error_Ticket_Create_Target_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`The ${i?.ticket} for this ${i?.client} changed while you were writing. Please try again.`)
};

const es_error_ticket_create_target_changed = /** @type {(inputs: Error_Ticket_Create_Target_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El ${i?.ticket} de este ${i?.client} cambió mientras escribías. Inténtalo de nuevo.`)
};

/**
* | output |
* | --- |
* | "The {ticket} for this {client} changed while you were writing. Please try again." |
*
* @param {Error_Ticket_Create_Target_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_create_target_changed = /** @type {((inputs: Error_Ticket_Create_Target_ChangedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Create_Target_ChangedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_ticket_create_target_changed(inputs)
	return es_error_ticket_create_target_changed(inputs)
});