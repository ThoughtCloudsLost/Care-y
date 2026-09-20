/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Subtype_PhoneInputs */

const en_intake_forms_config_subtype_phone = /** @type {(inputs: Intake_Forms_Config_Subtype_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone number`)
};

const es_intake_forms_config_subtype_phone = /** @type {(inputs: Intake_Forms_Config_Subtype_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Número de teléfono`)
};

const en_xa2_intake_forms_config_subtype_phone = /** @type {(inputs: Intake_Forms_Config_Subtype_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè nùmbèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone number" |
*
* @param {Intake_Forms_Config_Subtype_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_subtype_phone = /** @type {((inputs?: Intake_Forms_Config_Subtype_PhoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Subtype_PhoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_subtype_phone(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_subtype_phone(inputs)
	return en_intake_forms_config_subtype_phone(inputs)
});