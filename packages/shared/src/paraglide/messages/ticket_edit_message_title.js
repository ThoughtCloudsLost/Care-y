/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Edit_Message_TitleInputs */

const en_ticket_edit_message_title = /** @type {(inputs: Ticket_Edit_Message_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit message`)
};

const es_ticket_edit_message_title = /** @type {(inputs: Ticket_Edit_Message_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar mensaje`)
};

/**
* | output |
* | --- |
* | "Edit message" |
*
* @param {Ticket_Edit_Message_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_message_title = /** @type {((inputs?: Ticket_Edit_Message_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Edit_Message_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_edit_message_title(inputs)
	return es_ticket_edit_message_title(inputs)
});