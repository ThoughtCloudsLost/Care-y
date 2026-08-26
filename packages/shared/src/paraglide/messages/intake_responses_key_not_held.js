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

/**
* | output |
* | --- |
* | "Key not held" |
*
* @param {Intake_Responses_Key_Not_HeldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_key_not_held = /** @type {((inputs?: Intake_Responses_Key_Not_HeldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Key_Not_HeldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_key_not_held(inputs)
	return es_intake_responses_key_not_held(inputs)
});