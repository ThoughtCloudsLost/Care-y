/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Intake_Forms_Field_CountInputs */

const en_intake_forms_field_count = /** @type {(inputs: Intake_Forms_Field_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} fields`)
};

const es_intake_forms_field_count = /** @type {(inputs: Intake_Forms_Field_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} campos`)
};

const en_xa2_intake_forms_field_count = /** @type {(inputs: Intake_Forms_Field_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} fìèlds •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} fields" |
*
* @param {Intake_Forms_Field_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_count = /** @type {((inputs: Intake_Forms_Field_CountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_CountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_count(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_count(inputs)
	return en_intake_forms_field_count(inputs)
});