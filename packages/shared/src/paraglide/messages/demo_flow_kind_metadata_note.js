/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Kind_Metadata_NoteInputs */

const en_demo_flow_kind_metadata_note = /** @type {(inputs: Demo_Flow_Kind_Metadata_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Structural or operational data (counts, timestamps, status). Not sensitive on its own.`)
};

const es_demo_flow_kind_metadata_note = /** @type {(inputs: Demo_Flow_Kind_Metadata_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Datos estructurales u operativos (conteos, marcas de tiempo, estado). No sensibles por sí mismos.`)
};

/**
* | output |
* | --- |
* | "Structural or operational data (counts, timestamps, status). Not sensitive on its own." |
*
* @param {Demo_Flow_Kind_Metadata_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_metadata_note = /** @type {((inputs?: Demo_Flow_Kind_Metadata_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_Metadata_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_kind_metadata_note(inputs)
	return es_demo_flow_kind_metadata_note(inputs)
});