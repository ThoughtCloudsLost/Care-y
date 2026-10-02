/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_DisbursementsInputs */

const en_ticket_filter_type_disbursements = /** @type {(inputs: Ticket_Filter_Type_DisbursementsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disbursements`)
};

const es_ticket_filter_type_disbursements = /** @type {(inputs: Ticket_Filter_Type_DisbursementsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desembolsos`)
};

const en_xa2_ticket_filter_type_disbursements = /** @type {(inputs: Ticket_Filter_Type_DisbursementsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsbùrsèmènts ••••⟧`)
};

/**
* | output |
* | --- |
* | "Disbursements" |
*
* @param {Ticket_Filter_Type_DisbursementsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_disbursements = /** @type {((inputs?: Ticket_Filter_Type_DisbursementsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_DisbursementsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_type_disbursements(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_type_disbursements(inputs)
	return en_ticket_filter_type_disbursements(inputs)
});