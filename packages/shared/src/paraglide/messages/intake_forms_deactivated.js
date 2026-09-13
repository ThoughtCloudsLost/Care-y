/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_DeactivatedInputs */

const en_intake_forms_deactivated = /** @type {(inputs: Intake_Forms_DeactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form deactivated`)
};

const es_intake_forms_deactivated = /** @type {(inputs: Intake_Forms_DeactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario desactivado`)
};

/**
* | output |
* | --- |
* | "Form deactivated" |
*
* @param {Intake_Forms_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_deactivated = /** @type {((inputs?: Intake_Forms_DeactivatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_DeactivatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_deactivated(inputs)
	return es_intake_forms_deactivated(inputs)
});