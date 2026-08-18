/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Solving_ChallengeInputs */

const en_intake_solving_challenge = /** @type {(inputs: Intake_Solving_ChallengeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Securing your message...`)
};

const es_intake_solving_challenge = /** @type {(inputs: Intake_Solving_ChallengeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Protegiendo tu mensaje...`)
};

/**
* | output |
* | --- |
* | "Securing your message..." |
*
* @param {Intake_Solving_ChallengeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_solving_challenge = /** @type {((inputs?: Intake_Solving_ChallengeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Solving_ChallengeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_solving_challenge(inputs)
	return es_intake_solving_challenge(inputs)
});