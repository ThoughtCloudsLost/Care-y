/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Field_Name_PlaceholderInputs */

const en_intake_field_name_placeholder = /** @type {(inputs: Intake_Field_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`First name or alias`)
};

const es_intake_field_name_placeholder = /** @type {(inputs: Intake_Field_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre o alias`)
};

const en_xa2_intake_field_name_placeholder = /** @type {(inputs: Intake_Field_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìrst nàmè òr àlìàs ••••••⟧`)
};

/**
* | output |
* | --- |
* | "First name or alias" |
*
* @param {Intake_Field_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_field_name_placeholder = /** @type {((inputs?: Intake_Field_Name_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Field_Name_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_field_name_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_intake_field_name_placeholder(inputs)
	return en_intake_field_name_placeholder(inputs)
});