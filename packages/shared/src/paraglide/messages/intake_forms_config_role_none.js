/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_NoneInputs */

const en_intake_forms_config_role_none = /** @type {(inputs: Intake_Forms_Config_Role_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`None`)
};

const es_intake_forms_config_role_none = /** @type {(inputs: Intake_Forms_Config_Role_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ninguno`)
};

const en_xa2_intake_forms_config_role_none = /** @type {(inputs: Intake_Forms_Config_Role_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nònè ••⟧`)
};

/**
* | output |
* | --- |
* | "None" |
*
* @param {Intake_Forms_Config_Role_NoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_none = /** @type {((inputs?: Intake_Forms_Config_Role_NoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_NoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_role_none(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_role_none(inputs)
	return en_intake_forms_config_role_none(inputs)
});