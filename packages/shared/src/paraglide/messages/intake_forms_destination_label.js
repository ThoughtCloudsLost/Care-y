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

const en_xa2_intake_forms_destination_label = /** @type {(inputs: Intake_Forms_Destination_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèstìnàtìòn qùèùè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Destination queue" |
*
* @param {Intake_Forms_Destination_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_destination_label = /** @type {((inputs?: Intake_Forms_Destination_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Destination_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_destination_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_destination_label(inputs)
	return en_intake_forms_destination_label(inputs)
});