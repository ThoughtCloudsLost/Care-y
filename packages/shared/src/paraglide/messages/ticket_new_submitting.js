/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_SubmittingInputs */

const en_ticket_new_submitting = /** @type {(inputs: Ticket_New_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encrypting and saving...`)
};

const es_ticket_new_submitting = /** @type {(inputs: Ticket_New_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cifrando y guardando...`)
};

/**
* | output |
* | --- |
* | "Encrypting and saving..." |
*
* @param {Ticket_New_SubmittingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_submitting = /** @type {((inputs?: Ticket_New_SubmittingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_SubmittingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_submitting(inputs)
	return es_ticket_new_submitting(inputs)
});