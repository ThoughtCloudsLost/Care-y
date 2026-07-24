/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Meta_Followup_Count_OtherInputs */

const en_ticket_meta_followup_count_other = /** @type {(inputs: Ticket_Meta_Followup_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} follow-ups`)
};

const es_ticket_meta_followup_count_other = /** @type {(inputs: Ticket_Meta_Followup_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} seguimientos`)
};

/**
* | output |
* | --- |
* | "{count} follow-ups" |
*
* @param {Ticket_Meta_Followup_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_meta_followup_count_other = /** @type {((inputs: Ticket_Meta_Followup_Count_OtherInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Meta_Followup_Count_OtherInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_meta_followup_count_other(inputs)
	return es_ticket_meta_followup_count_other(inputs)
});