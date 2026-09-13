/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Intake_ResponsesInputs */

const en_permission_view_intake_responses = /** @type {(inputs: Permission_View_Intake_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View intake form responses`)
};

const es_permission_view_intake_responses = /** @type {(inputs: Permission_View_Intake_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver respuestas de formularios de ingreso`)
};

/**
* | output |
* | --- |
* | "View intake form responses" |
*
* @param {Permission_View_Intake_ResponsesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_intake_responses = /** @type {((inputs?: Permission_View_Intake_ResponsesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Intake_ResponsesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_view_intake_responses(inputs)
	return es_permission_view_intake_responses(inputs)
});