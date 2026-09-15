/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Intake_Responses_HintInputs */

const en_permission_view_intake_responses_hint = /** @type {(inputs: Permission_View_Intake_Responses_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Granting this decides who receives decryption keys when a form is submitted. Revoking it later does not take back keys already issued.`)
};

const es_permission_view_intake_responses_hint = /** @type {(inputs: Permission_View_Intake_Responses_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Al otorgar este permiso se decide quien recibe las claves de descifrado cuando se envia un formulario. Revocarlo despues no retira las claves ya entregadas.`)
};

/**
* | output |
* | --- |
* | "Granting this decides who receives decryption keys when a form is submitted. Revoking it later does not take back keys already issued." |
*
* @param {Permission_View_Intake_Responses_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_intake_responses_hint = /** @type {((inputs?: Permission_View_Intake_Responses_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Intake_Responses_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_intake_responses_hint(inputs)
	return en_permission_view_intake_responses_hint(inputs)
});