/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Continuation_HintInputs */

const en_intake_continuation_hint = /** @type {(inputs: Intake_Continuation_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The link above carries the key that unlocks your conversation. Save it before leaving this page.`)
};

const es_intake_continuation_hint = /** @type {(inputs: Intake_Continuation_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El enlace de arriba contiene la clave que desbloquea tu conversación. Guárdalo antes de salir de esta página.`)
};

/**
* | output |
* | --- |
* | "The link above carries the key that unlocks your conversation. Save it before leaving this page." |
*
* @param {Intake_Continuation_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_hint = /** @type {((inputs?: Intake_Continuation_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_continuation_hint(inputs)
	return es_intake_continuation_hint(inputs)
});