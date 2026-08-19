/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_Real_NameInputs */

const en_intake_forms_config_role_real_name = /** @type {(inputs: Intake_Forms_Config_Role_Real_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Real name`)
};

const es_intake_forms_config_role_real_name = /** @type {(inputs: Intake_Forms_Config_Role_Real_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre real`)
};

/**
* | output |
* | --- |
* | "Real name" |
*
* @param {Intake_Forms_Config_Role_Real_NameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_real_name = /** @type {((inputs?: Intake_Forms_Config_Role_Real_NameInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_Real_NameInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_real_name(inputs)
	return es_intake_forms_config_role_real_name(inputs)
});