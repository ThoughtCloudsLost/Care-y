/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Dirty_Guard_NoteInputs */

const en_demo_dirty_guard_note = /** @type {(inputs: Demo_Dirty_Guard_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unsaved input on the simulator. Select again to continue.`)
};

const es_demo_dirty_guard_note = /** @type {(inputs: Demo_Dirty_Guard_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hay datos sin guardar en el simulador. Selecciona de nuevo para continuar.`)
};

/**
* | output |
* | --- |
* | "Unsaved input on the simulator. Select again to continue." |
*
* @param {Demo_Dirty_Guard_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_dirty_guard_note = /** @type {((inputs?: Demo_Dirty_Guard_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Dirty_Guard_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_dirty_guard_note(inputs)
	return en_demo_dirty_guard_note(inputs)
});