/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_BoundInputs */

const en_intake_forms_bound = /** @type {(inputs: Intake_Forms_BoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form bound to queue`)
};

const es_intake_forms_bound = /** @type {(inputs: Intake_Forms_BoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario vinculado a la cola`)
};

/**
* | output |
* | --- |
* | "Form bound to queue" |
*
* @param {Intake_Forms_BoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_bound = /** @type {((inputs?: Intake_Forms_BoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_BoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_bound(inputs)
	return es_intake_forms_bound(inputs)
});