/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_IntroInputs */

const en_intake_intro = /** @type {(inputs: Intake_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We're here to help. What you write is encrypted on your device before it is sent.`)
};

const es_intake_intro = /** @type {(inputs: Intake_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estamos aquí para ayudarte. Lo que escribas se cifra en tu dispositivo antes de enviarse.`)
};

const en_xa2_intake_intro = /** @type {(inputs: Intake_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wè'rè hèrè tò hèlp. Whàt yòù wrìtè ìs èncryptèd òn yòùr dèvìcè bèfòrè ìt ìs sènt. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "We're here to help. What you write is encrypted on your device before it is sent." |
*
* @param {Intake_IntroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_intro = /** @type {((inputs?: Intake_IntroInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_IntroInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_intro(inputs)
	if (locale === "en-XA") return en_xa2_intake_intro(inputs)
	return en_intake_intro(inputs)
});