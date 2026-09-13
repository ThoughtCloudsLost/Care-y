/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Destination_LabelInputs */

const en_intake_forms_destination_label = /** @type {(inputs: Intake_Forms_Destination_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Destination queue`)
};

const es_intake_forms_destination_label = /** @type {(inputs: Intake_Forms_Destination_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cola de destino`)
};

/**
* | output |
* | --- |
* | "Destination queue" |
*
* @param {Intake_Forms_Destination_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_destination_label = /** @type {((inputs?: Intake_Forms_Destination_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Destination_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_destination_label(inputs)
	return es_intake_forms_destination_label(inputs)
});