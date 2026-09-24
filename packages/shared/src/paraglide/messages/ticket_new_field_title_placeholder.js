/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Field_Title_PlaceholderInputs */

const en_ticket_new_field_title_placeholder = /** @type {(inputs: Ticket_New_Field_Title_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Brief description of the issue`)
};

const es_ticket_new_field_title_placeholder = /** @type {(inputs: Ticket_New_Field_Title_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Breve descripción del problema`)
};

const en_xa2_ticket_new_field_title_placeholder = /** @type {(inputs: Ticket_New_Field_Title_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Brìèf dèscrìptìòn òf thè ìssùè •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Brief description of the issue" |
*
* @param {Ticket_New_Field_Title_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_title_placeholder = /** @type {((inputs?: Ticket_New_Field_Title_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_Title_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_field_title_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_field_title_placeholder(inputs)
	return en_ticket_new_field_title_placeholder(inputs)
});