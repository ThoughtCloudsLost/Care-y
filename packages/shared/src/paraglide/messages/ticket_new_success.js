/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Ticket_New_SuccessInputs */

const en_ticket_new_success = /** @type {(inputs: Ticket_New_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} created`)
};

const es_ticket_new_success = /** @type {(inputs: Ticket_New_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} creado`)
};

const en_xa2_ticket_new_success = /** @type {(inputs: Ticket_New_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} crèàtèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} created" |
*
* @param {Ticket_New_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_success = /** @type {((inputs: Ticket_New_SuccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_SuccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_success(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_success(inputs)
	return en_ticket_new_success(inputs)
});