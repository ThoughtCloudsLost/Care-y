/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Icon_LabelInputs */

const en_admin_note_types_icon_label = /** @type {(inputs: Admin_Note_Types_Icon_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Icon`)
};

const es_admin_note_types_icon_label = /** @type {(inputs: Admin_Note_Types_Icon_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Icono`)
};

/**
* | output |
* | --- |
* | "Icon" |
*
* @param {Admin_Note_Types_Icon_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_icon_label = /** @type {((inputs?: Admin_Note_Types_Icon_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Icon_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_icon_label(inputs)
	return es_admin_note_types_icon_label(inputs)
});