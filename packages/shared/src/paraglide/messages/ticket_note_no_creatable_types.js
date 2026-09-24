/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Note_No_Creatable_TypesInputs */

const en_ticket_note_no_creatable_types = /** @type {(inputs: Ticket_Note_No_Creatable_TypesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your role does not have permission to create any note types.`)
};

const es_ticket_note_no_creatable_types = /** @type {(inputs: Ticket_Note_No_Creatable_TypesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu rol no tiene permiso para crear ningún tipo de nota.`)
};

const en_xa2_ticket_note_no_creatable_types = /** @type {(inputs: Ticket_Note_No_Creatable_TypesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr ròlè dòès nòt hàvè pèrmìssìòn tò crèàtè àny nòtè typès. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your role does not have permission to create any note types." |
*
* @param {Ticket_Note_No_Creatable_TypesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_note_no_creatable_types = /** @type {((inputs?: Ticket_Note_No_Creatable_TypesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_No_Creatable_TypesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_note_no_creatable_types(inputs)
	if (locale === "en-XA") return en_xa2_ticket_note_no_creatable_types(inputs)
	return en_ticket_note_no_creatable_types(inputs)
});