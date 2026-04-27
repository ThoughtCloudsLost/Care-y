/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Phone_Number_LabelInputs */

const en_admin_greetings_phone_number_label = /** @type {(inputs: Admin_Greetings_Phone_Number_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone number`)
};

const es_admin_greetings_phone_number_label = /** @type {(inputs: Admin_Greetings_Phone_Number_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numero de telefono`)
};

/**
* | output |
* | --- |
* | "Phone number" |
*
* @param {Admin_Greetings_Phone_Number_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_phone_number_label = /** @type {((inputs?: Admin_Greetings_Phone_Number_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Phone_Number_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_phone_number_label(inputs)
	return es_admin_greetings_phone_number_label(inputs)
});