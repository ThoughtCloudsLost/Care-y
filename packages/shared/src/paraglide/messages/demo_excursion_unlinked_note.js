/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Excursion_Unlinked_NoteInputs */

const en_demo_excursion_unlinked_note = /** @type {(inputs: Demo_Excursion_Unlinked_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The simulator is unlinked while this guide is pinned.`)
};

const es_demo_excursion_unlinked_note = /** @type {(inputs: Demo_Excursion_Unlinked_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El simulador esta desvinculado mientras esta guia esta fijada.`)
};

/**
* | output |
* | --- |
* | "The simulator is unlinked while this guide is pinned." |
*
* @param {Demo_Excursion_Unlinked_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_excursion_unlinked_note = /** @type {((inputs?: Demo_Excursion_Unlinked_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Excursion_Unlinked_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_excursion_unlinked_note(inputs)
	return en_demo_excursion_unlinked_note(inputs)
});