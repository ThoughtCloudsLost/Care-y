/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_ActiveInputs */

const en_intake_forms_active = /** @type {(inputs: Intake_Forms_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Active`)
};

const es_intake_forms_active = /** @type {(inputs: Intake_Forms_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activo`)
};

/**
* | output |
* | --- |
* | "Active" |
*
* @param {Intake_Forms_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_active = /** @type {((inputs?: Intake_Forms_ActiveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_ActiveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_active(inputs)
	return es_intake_forms_active(inputs)
});