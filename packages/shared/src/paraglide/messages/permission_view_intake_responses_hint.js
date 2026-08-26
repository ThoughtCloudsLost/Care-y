/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Intake_Responses_HintInputs */

const en_permission_view_intake_responses_hint = /** @type {(inputs: Permission_View_Intake_Responses_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Grants decrypt capability for intake submissions across all queues. High-trust permission.`)
};

const es_permission_view_intake_responses_hint = /** @type {(inputs: Permission_View_Intake_Responses_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Otorga la capacidad de descifrar respuestas de ingreso en todas las colas. Permiso de alta confianza.`)
};

/**
* | output |
* | --- |
* | "Grants decrypt capability for intake submissions across all queues. High-trust permission." |
*
* @param {Permission_View_Intake_Responses_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_intake_responses_hint = /** @type {((inputs?: Permission_View_Intake_Responses_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Intake_Responses_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_view_intake_responses_hint(inputs)
	return es_permission_view_intake_responses_hint(inputs)
});