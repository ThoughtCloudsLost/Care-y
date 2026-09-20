/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Intake_Forms_Fields_HeadingInputs */

const en_intake_forms_fields_heading = /** @type {(inputs: Intake_Forms_Fields_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Fields (${i?.count})`)
};

const es_intake_forms_fields_heading = /** @type {(inputs: Intake_Forms_Fields_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Campos (${i?.count})`)
};

const en_xa2_intake_forms_fields_heading = /** @type {(inputs: Intake_Forms_Fields_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Fìèlds ( •••${i?.count}) •⟧`)
};

/**
* | output |
* | --- |
* | "Fields ({count})" |
*
* @param {Intake_Forms_Fields_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_fields_heading = /** @type {((inputs: Intake_Forms_Fields_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Fields_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_fields_heading(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_fields_heading(inputs)
	return en_intake_forms_fields_heading(inputs)
});