/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_CreateInputs */

const en_intake_forms_create = /** @type {(inputs: Intake_Forms_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create new form`)
};

const es_intake_forms_create = /** @type {(inputs: Intake_Forms_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear nuevo formulario`)
};

const en_xa2_intake_forms_create = /** @type {(inputs: Intake_Forms_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè nèw fòrm •••••⟧`)
};

/**
* | output |
* | --- |
* | "Create new form" |
*
* @param {Intake_Forms_CreateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_create = /** @type {((inputs?: Intake_Forms_CreateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_CreateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_create(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_create(inputs)
	return en_intake_forms_create(inputs)
});