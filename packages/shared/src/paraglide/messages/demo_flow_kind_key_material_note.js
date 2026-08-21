/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Kind_Key_Material_NoteInputs */

const en_demo_flow_kind_key_material_note = /** @type {(inputs: Demo_Flow_Kind_Key_Material_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cryptographic key or derived secret. Never stored, held in memory for the session only.`)
};

const es_demo_flow_kind_key_material_note = /** @type {(inputs: Demo_Flow_Kind_Key_Material_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clave criptográfica o secreto derivado. Nunca se almacena, solo se mantiene en memoria durante la sesión.`)
};

/**
* | output |
* | --- |
* | "Cryptographic key or derived secret. Never stored, held in memory for the session only." |
*
* @param {Demo_Flow_Kind_Key_Material_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_key_material_note = /** @type {((inputs?: Demo_Flow_Kind_Key_Material_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_Key_Material_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_kind_key_material_note(inputs)
	return es_demo_flow_kind_key_material_note(inputs)
});