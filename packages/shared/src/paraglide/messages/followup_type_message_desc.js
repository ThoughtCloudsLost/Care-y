/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Message_DescInputs */

const en_followup_type_message_desc = /** @type {(inputs: Followup_Type_Message_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inbound and outbound messages with callers`)
};

const es_followup_type_message_desc = /** @type {(inputs: Followup_Type_Message_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensajes entrantes y salientes con personas que llaman`)
};

/**
* | output |
* | --- |
* | "Inbound and outbound messages with callers" |
*
* @param {Followup_Type_Message_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_message_desc = /** @type {((inputs?: Followup_Type_Message_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Message_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_message_desc(inputs)
	return es_followup_type_message_desc(inputs)
});