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

const en_xa2_intake_forms_configure = /** @type {(inputs: Intake_Forms_ConfigureInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìgùrè •••⟧`)
};

/**
* | output |
* | --- |
* | "Configure" |
*
* @param {Intake_Forms_ConfigureInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_configure = /** @type {((inputs?: Intake_Forms_ConfigureInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_ConfigureInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_configure(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_configure(inputs)
	return en_intake_forms_configure(inputs)
});