/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_No_PhonesInputs */

const en_admin_greetings_no_phones = /** @type {(inputs: Admin_Greetings_No_PhonesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up phone numbers in the Telephony section before adding greetings.`)
};

const es_admin_greetings_no_phones = /** @type {(inputs: Admin_Greetings_No_PhonesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure los números de teléfono en la sección de Telefonía antes de agregar saludos.`)
};

const en_xa2_admin_greetings_no_phones = /** @type {(inputs: Admin_Greetings_No_PhonesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt ùp phònè nùmbèrs ìn thè Tèlèphòny sèctìòn bèfòrè àddìng grèètìngs. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Set up phone numbers in the Telephony section before adding greetings." |
*
* @param {Admin_Greetings_No_PhonesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_no_phones = /** @type {((inputs?: Admin_Greetings_No_PhonesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_No_PhonesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_no_phones(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_no_phones(inputs)
	return en_admin_greetings_no_phones(inputs)
});