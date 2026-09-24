/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Submit_Message_LabelInputs */

const en_intake_forms_submit_message_label = /** @type {(inputs: Intake_Forms_Submit_Message_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Success message`)
};

const es_intake_forms_submit_message_label = /** @type {(inputs: Intake_Forms_Submit_Message_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensaje de confirmación`)
};

const en_xa2_intake_forms_submit_message_label = /** @type {(inputs: Intake_Forms_Submit_Message_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sùccèss mèssàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Success message" |
*
* @param {Intake_Forms_Submit_Message_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_submit_message_label = /** @type {((inputs?: Intake_Forms_Submit_Message_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Submit_Message_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_submit_message_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_submit_message_label(inputs)
	return en_intake_forms_submit_message_label(inputs)
});