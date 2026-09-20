/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Add_SpecificInputs */

const en_intake_avail_add_specific = /** @type {(inputs: Intake_Avail_Add_SpecificInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add specific date`)
};

const es_intake_avail_add_specific = /** @type {(inputs: Intake_Avail_Add_SpecificInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar fecha específica`)
};

const en_xa2_intake_avail_add_specific = /** @type {(inputs: Intake_Avail_Add_SpecificInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd spècìfìc dàtè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Add specific date" |
*
* @param {Intake_Avail_Add_SpecificInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_add_specific = /** @type {((inputs?: Intake_Avail_Add_SpecificInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Add_SpecificInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_add_specific(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_add_specific(inputs)
	return en_intake_avail_add_specific(inputs)
});