/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_Volunteers_WhyInputs */

const en_intake_protected_volunteers_why = /** @type {(inputs: Intake_Protected_Volunteers_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Other people who use this system cannot see it. The server itself cannot see it. Access is limited to the specific people helping you.`)
};

const es_intake_protected_volunteers_why = /** @type {(inputs: Intake_Protected_Volunteers_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Otras personas que usan este sistema no pueden verla. El servidor tampoco puede verla. El acceso esta limitado a las personas que te estan ayudando.`)
};

/**
* | output |
* | --- |
* | "Other people who use this system cannot see it. The server itself cannot see it. Access is limited to the specific people helping you." |
*
* @param {Intake_Protected_Volunteers_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_volunteers_why = /** @type {((inputs?: Intake_Protected_Volunteers_WhyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_Volunteers_WhyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_protected_volunteers_why(inputs)
	return es_intake_protected_volunteers_why(inputs)
});