/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_DuplicatedInputs */

const en_intake_forms_duplicated = /** @type {(inputs: Intake_Forms_DuplicatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form duplicated`)
};

const es_intake_forms_duplicated = /** @type {(inputs: Intake_Forms_DuplicatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario duplicado`)
};

/**
* | output |
* | --- |
* | "Form duplicated" |
*
* @param {Intake_Forms_DuplicatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_duplicated = /** @type {((inputs?: Intake_Forms_DuplicatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_DuplicatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_duplicated(inputs)
	return es_intake_forms_duplicated(inputs)
});