/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, ticket: NonNullable<unknown> }} Admin_Note_Types_DescriptionInputs */

const en_admin_note_types_description = /** @type {(inputs: Admin_Note_Types_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Categories for follow-up notes on ${i?.tickets}. Each type can require escalation, restrict visibility by role, or be marked as required when closing a ${i?.ticket}.`)
};

const es_admin_note_types_description = /** @type {(inputs: Admin_Note_Types_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Categorias para notas de seguimiento en ${i?.tickets}. Cada tipo puede requerir escalamiento, restringir visibilidad por rol o ser obligatorio al cerrar un ${i?.ticket}.`)
};

/**
* | output |
* | --- |
* | "Categories for follow-up notes on {tickets}. Each type can require escalation, restrict visibility by role, or be marked as required when closing a {ticket}." |
*
* @param {Admin_Note_Types_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_description = /** @type {((inputs: Admin_Note_Types_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_description(inputs)
	return es_admin_note_types_description(inputs)
});