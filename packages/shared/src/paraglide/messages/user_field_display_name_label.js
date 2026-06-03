/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} User_Field_Display_Name_LabelInputs */

const en_user_field_display_name_label = /** @type {(inputs: User_Field_Display_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Display Name`)
};

const es_user_field_display_name_label = /** @type {(inputs: User_Field_Display_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre visible`)
};

/**
* | output |
* | --- |
* | "Display Name" |
*
* @param {User_Field_Display_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const user_field_display_name_label = /** @type {((inputs?: User_Field_Display_Name_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<User_Field_Display_Name_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_user_field_display_name_label(inputs)
	return es_user_field_display_name_label(inputs)
});