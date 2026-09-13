/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_ConsentInputs */

const en_intake_forms_config_role_consent = /** @type {(inputs: Intake_Forms_Config_Role_ConsentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Consent`)
};

const es_intake_forms_config_role_consent = /** @type {(inputs: Intake_Forms_Config_Role_ConsentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Consentimiento`)
};

/**
* | output |
* | --- |
* | "Consent" |
*
* @param {Intake_Forms_Config_Role_ConsentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_consent = /** @type {((inputs?: Intake_Forms_Config_Role_ConsentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_ConsentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_consent(inputs)
	return es_intake_forms_config_role_consent(inputs)
});