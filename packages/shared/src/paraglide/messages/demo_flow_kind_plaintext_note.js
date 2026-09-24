/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Kind_Plaintext_NoteInputs */

const en_demo_flow_kind_plaintext_note = /** @type {(inputs: Demo_Flow_Kind_Plaintext_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Readable content. Only appears above the encryption layer, never in the database.`)
};

const es_demo_flow_kind_plaintext_note = /** @type {(inputs: Demo_Flow_Kind_Plaintext_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contenido legible. Solo aparece por encima de la capa de cifrado, nunca en la base de datos.`)
};

const en_xa2_demo_flow_kind_plaintext_note = /** @type {(inputs: Demo_Flow_Kind_Plaintext_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèàdàblè còntènt. Ònly àppèàrs àbòvè thè èncryptìòn làyèr, nèvèr ìn thè dàtàbàsè. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Readable content. Only appears above the encryption layer, never in the database." |
*
* @param {Demo_Flow_Kind_Plaintext_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_plaintext_note = /** @type {((inputs?: Demo_Flow_Kind_Plaintext_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_Plaintext_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_kind_plaintext_note(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_kind_plaintext_note(inputs)
	return en_demo_flow_kind_plaintext_note(inputs)
});