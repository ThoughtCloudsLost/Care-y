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

const en_xa2_intake_forms_deactivated = /** @type {(inputs: Intake_Forms_DeactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòrm dèàctìvàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Form deactivated" |
*
* @param {Intake_Forms_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_deactivated = /** @type {((inputs?: Intake_Forms_DeactivatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_DeactivatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_deactivated(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_deactivated(inputs)
	return en_intake_forms_deactivated(inputs)
});