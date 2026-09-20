/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Intake_ResponsesInputs */

const en_permission_view_intake_responses = /** @type {(inputs: Permission_View_Intake_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View intake responses`)
};

const es_permission_view_intake_responses = /** @type {(inputs: Permission_View_Intake_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver respuestas de ingreso`)
};

const en_xa2_permission_view_intake_responses = /** @type {(inputs: Permission_View_Intake_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw ìntàkè rèspònsès •••••••⟧`)
};

/**
* | output |
* | --- |
* | "View intake responses" |
*
* @param {Permission_View_Intake_ResponsesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_view_intake_responses = /** @type {((inputs?: Permission_View_Intake_ResponsesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Intake_ResponsesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_intake_responses(inputs)
	if (locale === "en-XA") return en_xa2_permission_view_intake_responses(inputs)
	return en_permission_view_intake_responses(inputs)
});