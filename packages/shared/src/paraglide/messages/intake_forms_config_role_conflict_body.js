/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_Conflict_BodyInputs */

const en_intake_forms_config_role_conflict_body = /** @type {(inputs: Intake_Forms_Config_Role_Conflict_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue routing needs a question with one answer. Checkboxes let someone pick several options, and a case goes to a single queue, so the routing here would be ignored.`)
};

const es_intake_forms_config_role_conflict_body = /** @type {(inputs: Intake_Forms_Config_Role_Conflict_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El enrutamiento de cola necesita una pregunta con una sola respuesta. Las casillas de verificación permiten elegir varias opciones, y un caso va a una sola cola, así que el enrutamiento aquí se ignoraría.`)
};

/**
* | output |
* | --- |
* | "Queue routing needs a question with one answer. Checkboxes let someone pick several options, and a case goes to a single queue, so the routing here would be ..." |
*
* @param {Intake_Forms_Config_Role_Conflict_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_conflict_body = /** @type {((inputs?: Intake_Forms_Config_Role_Conflict_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_Conflict_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_conflict_body(inputs)
	return es_intake_forms_config_role_conflict_body(inputs)
});