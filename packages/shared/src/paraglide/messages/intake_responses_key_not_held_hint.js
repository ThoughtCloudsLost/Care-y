/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Key_Not_Held_HintInputs */

const en_intake_responses_key_not_held_hint = /** @type {(inputs: Intake_Responses_Key_Not_Held_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You do not have a key wrap for this submission. Another key holder can unlock it for you by viewing this page.`)
};

const es_intake_responses_key_not_held_hint = /** @type {(inputs: Intake_Responses_Key_Not_Held_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No tiene una clave para esta respuesta. Otro titular de clave puede desbloquearla al ver esta página.`)
};

const en_xa2_intake_responses_key_not_held_hint = /** @type {(inputs: Intake_Responses_Key_Not_Held_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòù dò nòt hàvè à kèy wràp fòr thìs sùbmìssìòn. Ànòthèr kèy hòldèr càn ùnlòck ìt fòr yòù by vìèwìng thìs pàgè. •••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "You do not have a key wrap for this submission. Another key holder can unlock it for you by viewing this page." |
*
* @param {Intake_Responses_Key_Not_Held_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_key_not_held_hint = /** @type {((inputs?: Intake_Responses_Key_Not_Held_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Key_Not_Held_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_key_not_held_hint(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_key_not_held_hint(inputs)
	return en_intake_responses_key_not_held_hint(inputs)
});