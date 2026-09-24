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

const en_xa2_intake_forms_config_role_conflict_blocked = /** @type {(inputs: Intake_Forms_Config_Role_Conflict_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngè thìs qùèstìòn tò Dròpdòwn, òr sèt thè ròlè tò Nònè, bèfòrè yòù fìnìsh. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Change this question to Dropdown, or set the role to None, before you finish." |
*
* @param {Intake_Forms_Config_Role_Conflict_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_conflict_blocked = /** @type {((inputs?: Intake_Forms_Config_Role_Conflict_BlockedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_Conflict_BlockedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_role_conflict_blocked(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_role_conflict_blocked(inputs)
	return en_intake_forms_config_role_conflict_blocked(inputs)
});