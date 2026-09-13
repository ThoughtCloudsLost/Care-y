/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_IntroInputs */

const en_intake_intro = /** @type {(inputs: Intake_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We're here to help. What you write is encrypted on your device before it is sent.`)
};

const es_intake_intro = /** @type {(inputs: Intake_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estamos aqui para ayudarte. Lo que escribas se cifra en tu dispositivo antes de enviarse.`)
};

/**
* | output |
* | --- |
* | "We're here to help. What you write is encrypted on your device before it is sent." |
*
* @param {Intake_IntroInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_intro = /** @type {((inputs?: Intake_IntroInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_IntroInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_intro(inputs)
	return es_intake_intro(inputs)
});