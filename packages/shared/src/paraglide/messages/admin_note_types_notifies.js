/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ targets: NonNullable<unknown> }} Admin_Note_Types_NotifiesInputs */

const en_admin_note_types_notifies = /** @type {(inputs: Admin_Note_Types_NotifiesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Notifies ${i?.targets}`)
};

const es_admin_note_types_notifies = /** @type {(inputs: Admin_Note_Types_NotifiesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Notifica a ${i?.targets}`)
};

const en_xa2_admin_note_types_notifies = /** @type {(inputs: Admin_Note_Types_NotifiesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nòtìfìès  •••${i?.targets}⟧`)
};

/**
* | output |
* | --- |
* | "Notifies {targets}" |
*
* @param {Admin_Note_Types_NotifiesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_notifies = /** @type {((inputs: Admin_Note_Types_NotifiesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_NotifiesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_notifies(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_notifies(inputs)
	return en_admin_note_types_notifies(inputs)
});