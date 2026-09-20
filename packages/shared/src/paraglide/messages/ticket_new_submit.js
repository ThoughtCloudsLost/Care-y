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

const en_xa2_ticket_new_submit = /** @type {(inputs: Ticket_New_SubmitInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè  •••${i?.Ticket}⟧`)
};

/**
* | output |
* | --- |
* | "Create {Ticket}" |
*
* @param {Ticket_New_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_submit = /** @type {((inputs: Ticket_New_SubmitInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_SubmitInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_submit(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_submit(inputs)
	return en_ticket_new_submit(inputs)
});