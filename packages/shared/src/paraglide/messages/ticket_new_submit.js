/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Ticket_New_SubmitInputs */

const en_ticket_new_submit = /** @type {(inputs: Ticket_New_SubmitInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Create ${i?.Ticket}`)
};

const es_ticket_new_submit = /** @type {(inputs: Ticket_New_SubmitInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Crear ${i?.Ticket}`)
};

/**
* | output |
* | --- |
* | "Create {Ticket}" |
*
* @param {Ticket_New_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_submit = /** @type {((inputs: Ticket_New_SubmitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_SubmitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_submit(inputs)
	return es_ticket_new_submit(inputs)
});