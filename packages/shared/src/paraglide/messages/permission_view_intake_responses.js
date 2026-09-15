/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Intake_ResponsesInputs */

const en_permission_view_intake_responses = /** @type {(inputs: Permission_View_Intake_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Read intake submissions from every queue`)
};

const es_permission_view_intake_responses = /** @type {(inputs: Permission_View_Intake_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Leer respuestas de ingreso de todas las colas`)
};

/**
* | output |
* | --- |
* | "Read intake submissions from every queue" |
*
* @param {Permission_View_Intake_ResponsesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_intake_responses = /** @type {((inputs?: Permission_View_Intake_ResponsesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Intake_ResponsesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_intake_responses(inputs)
	return en_permission_view_intake_responses(inputs)
});