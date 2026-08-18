/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Submit_HintInputs */

const en_intake_submit_hint = /** @type {(inputs: Intake_Submit_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What you wrote has been encrypted. Only assigned volunteers can read it. Even if someone breaks into this server, they cannot read it.`)
};

const es_intake_submit_hint = /** @type {(inputs: Intake_Submit_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lo que escribiste fue cifrado. Solo los voluntarios asignados pueden leerlo. Aunque alguien acceda a este servidor, no podra leerlo.`)
};

/**
* | output |
* | --- |
* | "What you wrote has been encrypted. Only assigned volunteers can read it. Even if someone breaks into this server, they cannot read it." |
*
* @param {Intake_Submit_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_submit_hint = /** @type {((inputs?: Intake_Submit_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Submit_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_submit_hint(inputs)
	return es_intake_submit_hint(inputs)
});