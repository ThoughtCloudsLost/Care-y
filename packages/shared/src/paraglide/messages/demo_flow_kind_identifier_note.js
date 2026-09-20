/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Kind_Identifier_NoteInputs */

const en_demo_flow_kind_identifier_note = /** @type {(inputs: Demo_Flow_Kind_Identifier_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opaque reference (UUID, row ID). Carries no readable content on its own.`)
};

const es_demo_flow_kind_identifier_note = /** @type {(inputs: Demo_Flow_Kind_Identifier_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Referencia opaca (UUID, ID de fila). No contiene contenido legible por sí mismo.`)
};

const en_xa2_demo_flow_kind_identifier_note = /** @type {(inputs: Demo_Flow_Kind_Identifier_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpàqùè rèfèrèncè (ÙÙÌD, ròw ÌD). Càrrìès nò rèàdàblè còntènt òn ìts òwn. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Opaque reference (UUID, row ID). Carries no readable content on its own." |
*
* @param {Demo_Flow_Kind_Identifier_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_identifier_note = /** @type {((inputs?: Demo_Flow_Kind_Identifier_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_Identifier_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_kind_identifier_note(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_kind_identifier_note(inputs)
	return en_demo_flow_kind_identifier_note(inputs)
});