/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_CommunicationsInputs */

const en_onboarding_step_communications = /** @type {(inputs: Onboarding_Step_CommunicationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comms`)
};

const es_onboarding_step_communications = /** @type {(inputs: Onboarding_Step_CommunicationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comunicaciones`)
};

const en_xa2_onboarding_step_communications = /** @type {(inputs: Onboarding_Step_CommunicationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmms ••⟧`)
};

/**
* | output |
* | --- |
* | "Comms" |
*
* @param {Onboarding_Step_CommunicationsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_communications = /** @type {((inputs?: Onboarding_Step_CommunicationsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_CommunicationsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_step_communications(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_step_communications(inputs)
	return en_onboarding_step_communications(inputs)
});