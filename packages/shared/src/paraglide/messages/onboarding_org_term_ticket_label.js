/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Term_Ticket_LabelInputs */

const en_onboarding_org_term_ticket_label = /** @type {(inputs: Onboarding_Org_Term_Ticket_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Work item (singular)`)
};

const es_onboarding_org_term_ticket_label = /** @type {(inputs: Onboarding_Org_Term_Ticket_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elemento de trabajo (singular)`)
};

/**
* | output |
* | --- |
* | "Work item (singular)" |
*
* @param {Onboarding_Org_Term_Ticket_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_term_ticket_label = /** @type {((inputs?: Onboarding_Org_Term_Ticket_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Term_Ticket_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_term_ticket_label(inputs)
	return es_onboarding_org_term_ticket_label(inputs)
});