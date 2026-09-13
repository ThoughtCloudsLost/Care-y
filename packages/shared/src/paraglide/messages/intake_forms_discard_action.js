/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Discard_ActionInputs */

const en_intake_forms_discard_action = /** @type {(inputs: Intake_Forms_Discard_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Discard`)
};

const es_intake_forms_discard_action = /** @type {(inputs: Intake_Forms_Discard_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descartar`)
};

/**
* | output |
* | --- |
* | "Discard" |
*
* @param {Intake_Forms_Discard_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_discard_action = /** @type {((inputs?: Intake_Forms_Discard_ActionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Discard_ActionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_discard_action(inputs)
	return es_intake_forms_discard_action(inputs)
});