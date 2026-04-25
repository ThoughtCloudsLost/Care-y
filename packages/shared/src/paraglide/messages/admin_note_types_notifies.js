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

/**
* | output |
* | --- |
* | "Notifies {targets}" |
*
* @param {Admin_Note_Types_NotifiesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_notifies = /** @type {((inputs: Admin_Note_Types_NotifiesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_NotifiesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_notifies(inputs)
	return es_admin_note_types_notifies(inputs)
});