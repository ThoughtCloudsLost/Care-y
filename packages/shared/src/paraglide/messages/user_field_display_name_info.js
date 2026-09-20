/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown> }} User_Field_Display_Name_InfoInputs */

const en_user_field_display_name_info = /** @type {(inputs: User_Field_Display_Name_InfoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Visible to other ${i?.volunteers} in your organization. End-to-end encrypted.`)
};

const es_user_field_display_name_info = /** @type {(inputs: User_Field_Display_Name_InfoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Visible para otros ${i?.volunteers} en tu organización. Cifrado de extremo a extremo.`)
};

const en_xa2_user_field_display_name_info = /** @type {(inputs: User_Field_Display_Name_InfoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Vìsìblè tò òthèr  ••••••${i?.volunteers} ìn yòùr òrgànìzàtìòn. Ènd-tò-ènd èncryptèd. ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Visible to other {volunteers} in your organization. End-to-end encrypted." |
*
* @param {User_Field_Display_Name_InfoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const user_field_display_name_info = /** @type {((inputs: User_Field_Display_Name_InfoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<User_Field_Display_Name_InfoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_user_field_display_name_info(inputs)
	if (locale === "en-XA") return en_xa2_user_field_display_name_info(inputs)
	return en_user_field_display_name_info(inputs)
});