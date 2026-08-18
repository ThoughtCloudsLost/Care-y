/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_ConfigureInputs */

const en_intake_forms_configure = /** @type {(inputs: Intake_Forms_ConfigureInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure`)
};

const es_intake_forms_configure = /** @type {(inputs: Intake_Forms_ConfigureInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar`)
};

/**
* | output |
* | --- |
* | "Configure" |
*
* @param {Intake_Forms_ConfigureInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_configure = /** @type {((inputs?: Intake_Forms_ConfigureInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_ConfigureInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_configure(inputs)
	return es_intake_forms_configure(inputs)
});