/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Error_Title_RequiredInputs */

const en_ticket_new_error_title_required = /** @type {(inputs: Ticket_New_Error_Title_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Title is required`)
};

const es_ticket_new_error_title_required = /** @type {(inputs: Ticket_New_Error_Title_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El título es obligatorio`)
};

const en_xa2_ticket_new_error_title_required = /** @type {(inputs: Ticket_New_Error_Title_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìtlè ìs rèqùìrèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Title is required" |
*
* @param {Ticket_New_Error_Title_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_title_required = /** @type {((inputs?: Ticket_New_Error_Title_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Error_Title_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_error_title_required(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_error_title_required(inputs)
	return en_ticket_new_error_title_required(inputs)
});