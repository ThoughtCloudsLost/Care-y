/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_Conflict_ActionInputs */

const en_intake_forms_config_role_conflict_action = /** @type {(inputs: Intake_Forms_Config_Role_Conflict_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change to Dropdown`)
};

const es_intake_forms_config_role_conflict_action = /** @type {(inputs: Intake_Forms_Config_Role_Conflict_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar a Lista desplegable`)
};

/**
* | output |
* | --- |
* | "Change to Dropdown" |
*
* @param {Intake_Forms_Config_Role_Conflict_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_conflict_action = /** @type {((inputs?: Intake_Forms_Config_Role_Conflict_ActionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_Conflict_ActionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_conflict_action(inputs)
	return es_intake_forms_config_role_conflict_action(inputs)
});