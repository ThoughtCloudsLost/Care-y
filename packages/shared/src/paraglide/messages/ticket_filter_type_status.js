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

const en_xa2_ticket_filter_type_status = /** @type {(inputs: Ticket_Filter_Type_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stàtùs Chàngès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Status Changes" |
*
* @param {Ticket_Filter_Type_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_status = /** @type {((inputs?: Ticket_Filter_Type_StatusInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_StatusInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_type_status(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_type_status(inputs)
	return en_ticket_filter_type_status(inputs)
});