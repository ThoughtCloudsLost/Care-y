/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Error_Title_RequiredInputs */

const en_ticket_new_error_title_required = /** @type {(inputs: Ticket_New_Error_Title_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Title is required`)
};

const es_ticket_new_error_title_required = /** @type {(inputs: Ticket_New_Error_Title_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El titulo es obligatorio`)
};

/**
* | output |
* | --- |
* | "Title is required" |
*
* @param {Ticket_New_Error_Title_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_title_required = /** @type {((inputs?: Ticket_New_Error_Title_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Error_Title_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_error_title_required(inputs)
	return es_ticket_new_error_title_required(inputs)
});