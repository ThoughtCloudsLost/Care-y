/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_BindInputs */

const en_intake_forms_bind = /** @type {(inputs: Intake_Forms_BindInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bind`)
};

const es_intake_forms_bind = /** @type {(inputs: Intake_Forms_BindInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vincular`)
};

const en_xa2_intake_forms_bind = /** @type {(inputs: Intake_Forms_BindInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bìnd ••⟧`)
};

/**
* | output |
* | --- |
* | "Bind" |
*
* @param {Intake_Forms_BindInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_bind = /** @type {((inputs?: Intake_Forms_BindInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_BindInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_bind(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_bind(inputs)
	return en_intake_forms_bind(inputs)
});