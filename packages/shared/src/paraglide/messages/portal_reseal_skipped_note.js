/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Reseal_Skipped_NoteInputs */

const en_portal_reseal_skipped_note = /** @type {(inputs: Portal_Reseal_Skipped_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Some earlier messages could not be opened on this device, so they were left out of this change. Everything you can read here is unaffected.`)
};

const es_portal_reseal_skipped_note = /** @type {(inputs: Portal_Reseal_Skipped_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Algunos mensajes anteriores no se pudieron abrir en este dispositivo, así que quedaron fuera de este cambio. Todo lo que puedes leer aquí sigue igual.`)
};

/**
* | output |
* | --- |
* | "Some earlier messages could not be opened on this device, so they were left out of this change. Everything you can read here is unaffected." |
*
* @param {Portal_Reseal_Skipped_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_reseal_skipped_note = /** @type {((inputs?: Portal_Reseal_Skipped_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Reseal_Skipped_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_reseal_skipped_note(inputs)
	return en_portal_reseal_skipped_note(inputs)
});