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

const en_xa2_demo_flow_kind_metadata_note = /** @type {(inputs: Demo_Flow_Kind_Metadata_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Strùctùràl òr òpèràtìònàl dàtà (còùnts, tìmèstàmps, stàtùs). Nòt sènsìtìvè òn ìts òwn. ••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Structural or operational data (counts, timestamps, status). Not sensitive on its own." |
*
* @param {Demo_Flow_Kind_Metadata_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_metadata_note = /** @type {((inputs?: Demo_Flow_Kind_Metadata_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_Metadata_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_kind_metadata_note(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_kind_metadata_note(inputs)
	return en_demo_flow_kind_metadata_note(inputs)
});