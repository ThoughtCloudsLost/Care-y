/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_MergeInputs */

const en_ticket_filter_type_merge = /** @type {(inputs: Ticket_Filter_Type_MergeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merges`)
};

const es_ticket_filter_type_merge = /** @type {(inputs: Ticket_Filter_Type_MergeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fusiones`)
};

/**
* | output |
* | --- |
* | "Merges" |
*
* @param {Ticket_Filter_Type_MergeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_merge = /** @type {((inputs?: Ticket_Filter_Type_MergeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_MergeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_filter_type_merge(inputs)
	return es_ticket_filter_type_merge(inputs)
});