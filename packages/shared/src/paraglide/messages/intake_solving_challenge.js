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

const en_xa2_intake_solving_challenge = /** @type {(inputs: Intake_Solving_ChallengeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècùrìng yòùr mèssàgè... ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Securing your message..." |
*
* @param {Intake_Solving_ChallengeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_solving_challenge = /** @type {((inputs?: Intake_Solving_ChallengeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Solving_ChallengeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_solving_challenge(inputs)
	if (locale === "en-XA") return en_xa2_intake_solving_challenge(inputs)
	return en_intake_solving_challenge(inputs)
});