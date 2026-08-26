/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Key_Not_Held_HintInputs */

const en_intake_responses_key_not_held_hint = /** @type {(inputs: Intake_Responses_Key_Not_Held_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You do not have a key wrap for this submission. Another key holder can unlock it for you by viewing this page.`)
};

const es_intake_responses_key_not_held_hint = /** @type {(inputs: Intake_Responses_Key_Not_Held_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No tiene una clave para esta respuesta. Otro titular de clave puede desbloquearla al ver esta pagina.`)
};

/**
* | output |
* | --- |
* | "You do not have a key wrap for this submission. Another key holder can unlock it for you by viewing this page." |
*
* @param {Intake_Responses_Key_Not_Held_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_key_not_held_hint = /** @type {((inputs?: Intake_Responses_Key_Not_Held_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Key_Not_Held_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_key_not_held_hint(inputs)
	return es_intake_responses_key_not_held_hint(inputs)
});