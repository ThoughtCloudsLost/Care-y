/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Ticket_Content_Edit_TitleInputs */

const en_ticket_content_edit_title = /** @type {(inputs: Ticket_Content_Edit_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Edit ${i?.Ticket}`)
};

const es_ticket_content_edit_title = /** @type {(inputs: Ticket_Content_Edit_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Editar ${i?.Ticket}`)
};

/**
* | output |
* | --- |
* | "Edit {Ticket}" |
*
* @param {Ticket_Content_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_content_edit_title = /** @type {((inputs: Ticket_Content_Edit_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Content_Edit_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_content_edit_title(inputs)
	return es_ticket_content_edit_title(inputs)
});