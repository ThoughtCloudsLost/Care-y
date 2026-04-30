/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Placeholder_PendingInputs */

const en_onboarding_placeholder_pending = /** @type {(inputs: Onboarding_Placeholder_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This step will be available soon.`)
};

const es_onboarding_placeholder_pending = /** @type {(inputs: Onboarding_Placeholder_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este paso estara disponible pronto.`)
};

/**
* | output |
* | --- |
* | "This step will be available soon." |
*
* @param {Onboarding_Placeholder_PendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_placeholder_pending = /** @type {((inputs?: Onboarding_Placeholder_PendingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Placeholder_PendingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_placeholder_pending(inputs)
	return es_onboarding_placeholder_pending(inputs)
});