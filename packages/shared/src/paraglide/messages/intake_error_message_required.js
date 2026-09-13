/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_Message_RequiredInputs */

const en_intake_error_message_required = /** @type {(inputs: Intake_Error_Message_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Please write a message so we know how to help.`)
};

const es_intake_error_message_required = /** @type {(inputs: Intake_Error_Message_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Por favor escribe un mensaje para que podamos ayudarte.`)
};

/**
* | output |
* | --- |
* | "Please write a message so we know how to help." |
*
* @param {Intake_Error_Message_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_message_required = /** @type {((inputs?: Intake_Error_Message_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Message_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_message_required(inputs)
	return es_intake_error_message_required(inputs)
});