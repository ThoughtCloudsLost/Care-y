/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Field_Message_PlaceholderInputs */

const en_intake_field_message_placeholder = /** @type {(inputs: Intake_Field_Message_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What's going on?`)
};

const es_intake_field_message_placeholder = /** @type {(inputs: Intake_Field_Message_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Que esta pasando?`)
};

/**
* | output |
* | --- |
* | "What's going on?" |
*
* @param {Intake_Field_Message_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_field_message_placeholder = /** @type {((inputs?: Intake_Field_Message_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Field_Message_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_field_message_placeholder(inputs)
	return es_intake_field_message_placeholder(inputs)
});