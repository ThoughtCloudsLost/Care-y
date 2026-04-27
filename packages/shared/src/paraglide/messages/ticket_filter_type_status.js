/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_StatusInputs */

const en_ticket_filter_type_status = /** @type {(inputs: Ticket_Filter_Type_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Status Changes`)
};

const es_ticket_filter_type_status = /** @type {(inputs: Ticket_Filter_Type_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambios de estado`)
};

/**
* | output |
* | --- |
* | "Status Changes" |
*
* @param {Ticket_Filter_Type_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_status = /** @type {((inputs?: Ticket_Filter_Type_StatusInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_StatusInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_filter_type_status(inputs)
	return es_ticket_filter_type_status(inputs)
});