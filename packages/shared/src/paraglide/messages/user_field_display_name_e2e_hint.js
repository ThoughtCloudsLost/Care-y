/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} User_Field_Display_Name_E2e_HintInputs */

const en_user_field_display_name_e2e_hint = /** @type {(inputs: User_Field_Display_Name_E2e_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`End-to-end encrypted. Only your team can read this.`)
};

const es_user_field_display_name_e2e_hint = /** @type {(inputs: User_Field_Display_Name_E2e_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cifrado de extremo a extremo. Solo su equipo puede leerlo.`)
};

/**
* | output |
* | --- |
* | "End-to-end encrypted. Only your team can read this." |
*
* @param {User_Field_Display_Name_E2e_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const user_field_display_name_e2e_hint = /** @type {((inputs?: User_Field_Display_Name_E2e_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<User_Field_Display_Name_E2e_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_user_field_display_name_e2e_hint(inputs)
	return es_user_field_display_name_e2e_hint(inputs)
});