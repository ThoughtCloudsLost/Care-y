/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Kind_Ciphertext_NoteInputs */

const en_demo_flow_kind_ciphertext_note = /** @type {(inputs: Demo_Flow_Kind_Ciphertext_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encrypted at rest. A seized database yields only this opaque value.`)
};

const es_demo_flow_kind_ciphertext_note = /** @type {(inputs: Demo_Flow_Kind_Ciphertext_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cifrado en reposo. Una base de datos incautada solo contiene este valor opaco.`)
};

const en_xa2_demo_flow_kind_ciphertext_note = /** @type {(inputs: Demo_Flow_Kind_Ciphertext_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èncryptèd àt rèst. À sèìzèd dàtàbàsè yìèlds ònly thìs òpàqùè vàlùè. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Encrypted at rest. A seized database yields only this opaque value." |
*
* @param {Demo_Flow_Kind_Ciphertext_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_ciphertext_note = /** @type {((inputs?: Demo_Flow_Kind_Ciphertext_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_Ciphertext_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_kind_ciphertext_note(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_kind_ciphertext_note(inputs)
	return en_demo_flow_kind_ciphertext_note(inputs)
});