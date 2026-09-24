/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Mock_NoteInputs */

const en_admin_telephony_mock_note = /** @type {(inputs: Admin_Telephony_Mock_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This organization uses a simulated phone provider. No real calls or messages are sent or received.`)
};

const es_admin_telephony_mock_note = /** @type {(inputs: Admin_Telephony_Mock_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta organización usa un proveedor simulado. No se envían ni reciben llamadas ni mensajes reales.`)
};

const en_xa2_admin_telephony_mock_note = /** @type {(inputs: Admin_Telephony_Mock_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs òrgànìzàtìòn ùsès à sìmùlàtèd phònè pròvìdèr. Nò rèàl càlls òr mèssàgès àrè sènt òr rècèìvèd. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This organization uses a simulated phone provider. No real calls or messages are sent or received." |
*
* @param {Admin_Telephony_Mock_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_mock_note = /** @type {((inputs?: Admin_Telephony_Mock_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Mock_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_mock_note(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_mock_note(inputs)
	return en_admin_telephony_mock_note(inputs)
});