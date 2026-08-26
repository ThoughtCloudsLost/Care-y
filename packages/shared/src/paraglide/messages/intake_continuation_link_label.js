/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Continuation_Link_LabelInputs */

const en_intake_continuation_link_label = /** @type {(inputs: Intake_Continuation_Link_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your continuation link:`)
};

const es_intake_continuation_link_label = /** @type {(inputs: Intake_Continuation_Link_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu enlace de continuación:`)
};

/**
* | output |
* | --- |
* | "Your continuation link:" |
*
* @param {Intake_Continuation_Link_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_link_label = /** @type {((inputs?: Intake_Continuation_Link_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_Link_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_continuation_link_label(inputs)
	return es_intake_continuation_link_label(inputs)
});