/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Subtype_EmailInputs */

const en_intake_forms_config_subtype_email = /** @type {(inputs: Intake_Forms_Config_Subtype_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email address`)
};

const es_intake_forms_config_subtype_email = /** @type {(inputs: Intake_Forms_Config_Subtype_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo electrónico`)
};

const en_xa2_intake_forms_config_subtype_email = /** @type {(inputs: Intake_Forms_Config_Subtype_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl àddrèss ••••⟧`)
};

/**
* | output |
* | --- |
* | "Email address" |
*
* @param {Intake_Forms_Config_Subtype_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_subtype_email = /** @type {((inputs?: Intake_Forms_Config_Subtype_EmailInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Subtype_EmailInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_subtype_email(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_subtype_email(inputs)
	return en_intake_forms_config_subtype_email(inputs)
});