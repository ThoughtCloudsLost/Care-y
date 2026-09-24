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

const en_xa2_ticket_edit_message_title = /** @type {(inputs: Ticket_Edit_Message_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt mèssàgè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Edit message" |
*
* @param {Ticket_Edit_Message_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_message_title = /** @type {((inputs?: Ticket_Edit_Message_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Edit_Message_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_edit_message_title(inputs)
	if (locale === "en-XA") return en_xa2_ticket_edit_message_title(inputs)
	return en_ticket_edit_message_title(inputs)
});