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

/**
* | output |
* | --- |
* | "Bind" |
*
* @param {Intake_Forms_BindInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_bind = /** @type {((inputs?: Intake_Forms_BindInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_BindInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_bind(inputs)
	return es_intake_forms_bind(inputs)
});