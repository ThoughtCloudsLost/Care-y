/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Continuation_CopiedInputs */

const en_intake_continuation_copied = /** @type {(inputs: Intake_Continuation_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link copied.`)
};

const es_intake_continuation_copied = /** @type {(inputs: Intake_Continuation_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace copiado.`)
};

/**
* | output |
* | --- |
* | "Link copied." |
*
* @param {Intake_Continuation_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_copied = /** @type {((inputs?: Intake_Continuation_CopiedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_CopiedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_continuation_copied(inputs)
	return es_intake_continuation_copied(inputs)
});