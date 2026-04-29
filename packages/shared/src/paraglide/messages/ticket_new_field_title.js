/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Field_TitleInputs */

const en_ticket_new_field_title = /** @type {(inputs: Ticket_New_Field_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Title`)
};

const es_ticket_new_field_title = /** @type {(inputs: Ticket_New_Field_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Titulo`)
};

/**
* | output |
* | --- |
* | "Title" |
*
* @param {Ticket_New_Field_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_title = /** @type {((inputs?: Ticket_New_Field_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_field_title(inputs)
	return es_ticket_new_field_title(inputs)
});