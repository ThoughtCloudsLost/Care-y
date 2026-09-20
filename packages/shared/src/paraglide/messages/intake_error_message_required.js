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

const en_xa2_intake_error_message_required = /** @type {(inputs: Intake_Error_Message_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Plèàsè wrìtè à mèssàgè sò wè knòw hòw tò hèlp. ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Please write a message so we know how to help." |
*
* @param {Intake_Error_Message_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_message_required = /** @type {((inputs?: Intake_Error_Message_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Message_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_error_message_required(inputs)
	if (locale === "en-XA") return en_xa2_intake_error_message_required(inputs)
	return en_intake_error_message_required(inputs)
});