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

/**
* | output |
* | --- |
* | "Fields ({count})" |
*
* @param {Intake_Forms_Fields_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_fields_heading = /** @type {((inputs: Intake_Forms_Fields_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Fields_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_fields_heading(inputs)
	return es_intake_forms_fields_heading(inputs)
});