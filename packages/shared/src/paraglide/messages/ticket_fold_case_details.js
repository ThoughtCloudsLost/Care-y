/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Ticket_Fold_Case_DetailsInputs */

const en_ticket_fold_case_details = /** @type {(inputs: Ticket_Fold_Case_DetailsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Fold ${i?.ticket} details`)
};

const es_ticket_fold_case_details = /** @type {(inputs: Ticket_Fold_Case_DetailsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Plegar detalles del ${i?.ticket}`)
};

/**
* | output |
* | --- |
* | "Fold {ticket} details" |
*
* @param {Ticket_Fold_Case_DetailsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_fold_case_details = /** @type {((inputs: Ticket_Fold_Case_DetailsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Fold_Case_DetailsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_fold_case_details(inputs)
	return es_ticket_fold_case_details(inputs)
});