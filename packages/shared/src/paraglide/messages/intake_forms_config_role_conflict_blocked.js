/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_Conflict_BlockedInputs */

const en_intake_forms_config_role_conflict_blocked = /** @type {(inputs: Intake_Forms_Config_Role_Conflict_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change this question to Dropdown, or set the role to None, before you finish.`)
};

const es_intake_forms_config_role_conflict_blocked = /** @type {(inputs: Intake_Forms_Config_Role_Conflict_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambia esta pregunta a Lista desplegable, o pon el rol en Ninguno, antes de terminar.`)
};

/**
* | output |
* | --- |
* | "Change this question to Dropdown, or set the role to None, before you finish." |
*
* @param {Intake_Forms_Config_Role_Conflict_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_conflict_blocked = /** @type {((inputs?: Intake_Forms_Config_Role_Conflict_BlockedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_Conflict_BlockedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_conflict_blocked(inputs)
	return es_intake_forms_config_role_conflict_blocked(inputs)
});