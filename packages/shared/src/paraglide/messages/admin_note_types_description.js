/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, ticket: NonNullable<unknown> }} Admin_Note_Types_DescriptionInputs */

const en_admin_note_types_description = /** @type {(inputs: Admin_Note_Types_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Categories for follow-up notes on ${i?.tickets}. Each type can require escalation, restrict visibility by role, or be marked as required when closing a ${i?.ticket}.`)
};

const es_admin_note_types_description = /** @type {(inputs: Admin_Note_Types_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Categorías para notas de seguimiento en ${i?.tickets}. Cada tipo puede requerir escalamiento, restringir visibilidad por rol o ser obligatorio al cerrar un ${i?.ticket}.`)
};

const en_xa2_admin_note_types_description = /** @type {(inputs: Admin_Note_Types_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Càtègòrìès fòr fòllòw-ùp nòtès òn  •••••••••••${i?.tickets}. Èàch typè càn rèqùìrè èscàlàtìòn, rèstrìct vìsìbìlìty by ròlè, òr bè màrkèd às rèqùìrèd whèn clòsìng à  ••••••••••••••••••••••••••••••••${i?.ticket}. •⟧`)
};

/**
* | output |
* | --- |
* | "Categories for follow-up notes on {tickets}. Each type can require escalation, restrict visibility by role, or be marked as required when closing a {ticket}." |
*
* @param {Admin_Note_Types_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_description = /** @type {((inputs: Admin_Note_Types_DescriptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_DescriptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_description(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_description(inputs)
	return en_admin_note_types_description(inputs)
});