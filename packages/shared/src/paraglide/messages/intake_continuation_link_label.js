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

const en_xa2_intake_continuation_link_label = /** @type {(inputs: Intake_Continuation_Link_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr còntìnùàtìòn lìnk: •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your continuation link:" |
*
* @param {Intake_Continuation_Link_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_link_label = /** @type {((inputs?: Intake_Continuation_Link_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_Link_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_continuation_link_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_continuation_link_label(inputs)
	return en_intake_continuation_link_label(inputs)
});