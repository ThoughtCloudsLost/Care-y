/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Key_Not_HeldInputs */

const en_intake_responses_key_not_held = /** @type {(inputs: Intake_Responses_Key_Not_HeldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Key not held`)
};

const es_intake_responses_key_not_held = /** @type {(inputs: Intake_Responses_Key_Not_HeldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clave no disponible`)
};

const en_xa2_intake_responses_key_not_held = /** @type {(inputs: Intake_Responses_Key_Not_HeldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Kèy nòt hèld ••••⟧`)
};

/**
* | output |
* | --- |
* | "Key not held" |
*
* @param {Intake_Responses_Key_Not_HeldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_key_not_held = /** @type {((inputs?: Intake_Responses_Key_Not_HeldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Key_Not_HeldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_key_not_held(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_key_not_held(inputs)
	return en_intake_responses_key_not_held(inputs)
});