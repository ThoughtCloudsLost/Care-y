/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_HintInputs */

const en_intake_forms_config_role_hint = /** @type {(inputs: Intake_Forms_Config_Role_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Controls how the system treats the answer. Roles cover contact matching, queue routing, urgency, and safety handling.`)
};

const es_intake_forms_config_role_hint = /** @type {(inputs: Intake_Forms_Config_Role_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Controla como el sistema trata la respuesta. Los roles cubren coincidencia de contactos, enrutamiento de colas, urgencia y manejo de seguridad.`)
};

/**
* | output |
* | --- |
* | "Controls how the system treats the answer. Roles cover contact matching, queue routing, urgency, and safety handling." |
*
* @param {Intake_Forms_Config_Role_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_hint = /** @type {((inputs?: Intake_Forms_Config_Role_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_hint(inputs)
	return es_intake_forms_config_role_hint(inputs)
});