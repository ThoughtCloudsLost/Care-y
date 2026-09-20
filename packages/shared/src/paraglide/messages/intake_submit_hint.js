/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Submit_HintInputs */

const en_intake_submit_hint = /** @type {(inputs: Intake_Submit_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encrypted before it is sent. Readable only within the organization, and only by your case volunteers once someone takes your case.`)
};

const es_intake_submit_hint = /** @type {(inputs: Intake_Submit_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se cifra antes de enviarse. Solo es legible dentro de la organización, y solo por los voluntarios de tu caso una vez que alguien lo toma.`)
};

/**
* | output |
* | --- |
* | "Encrypted before it is sent. Readable only within the organization, and only by your case volunteers once someone takes your case." |
*
* @param {Intake_Submit_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_submit_hint = /** @type {((inputs?: Intake_Submit_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Submit_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_submit_hint(inputs)
	return en_intake_submit_hint(inputs)
});