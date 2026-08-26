/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Intake_Forms_Destination_Default_NamedInputs */

const en_intake_forms_destination_default_named = /** @type {(inputs: Intake_Forms_Destination_Default_NamedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Default intake queue (${i?.name})`)
};

const es_intake_forms_destination_default_named = /** @type {(inputs: Intake_Forms_Destination_Default_NamedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cola de recepcion predeterminada (${i?.name})`)
};

/**
* | output |
* | --- |
* | "Default intake queue ({name})" |
*
* @param {Intake_Forms_Destination_Default_NamedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_destination_default_named = /** @type {((inputs: Intake_Forms_Destination_Default_NamedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Destination_Default_NamedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_destination_default_named(inputs)
	return es_intake_forms_destination_default_named(inputs)
});