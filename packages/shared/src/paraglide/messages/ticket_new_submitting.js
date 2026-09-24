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

const en_xa2_ticket_new_submitting = /** @type {(inputs: Ticket_New_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èncryptìng ànd sàvìng... ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Encrypting and saving..." |
*
* @param {Ticket_New_SubmittingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_submitting = /** @type {((inputs?: Ticket_New_SubmittingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_SubmittingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_submitting(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_submitting(inputs)
	return en_ticket_new_submitting(inputs)
});