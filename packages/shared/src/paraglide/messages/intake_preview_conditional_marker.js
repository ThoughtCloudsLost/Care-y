/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Preview_Conditional_MarkerInputs */

const en_intake_preview_conditional_marker = /** @type {(inputs: Intake_Preview_Conditional_MarkerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Conditional page`)
};

const es_intake_preview_conditional_marker = /** @type {(inputs: Intake_Preview_Conditional_MarkerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Página condicional`)
};

const en_xa2_intake_preview_conditional_marker = /** @type {(inputs: Intake_Preview_Conditional_MarkerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còndìtìònàl pàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Conditional page" |
*
* @param {Intake_Preview_Conditional_MarkerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_preview_conditional_marker = /** @type {((inputs?: Intake_Preview_Conditional_MarkerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Preview_Conditional_MarkerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_preview_conditional_marker(inputs)
	if (locale === "en-XA") return en_xa2_intake_preview_conditional_marker(inputs)
	return en_intake_preview_conditional_marker(inputs)
});