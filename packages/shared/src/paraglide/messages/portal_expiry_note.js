/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Expiry_NoteInputs */

const en_portal_expiry_note = /** @type {(inputs: Portal_Expiry_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Messages are removed after 30 days of inactivity.`)
};

const es_portal_expiry_note = /** @type {(inputs: Portal_Expiry_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los mensajes se eliminan después de 30 días de inactividad.`)
};

/**
* | output |
* | --- |
* | "Messages are removed after 30 days of inactivity." |
*
* @param {Portal_Expiry_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_expiry_note = /** @type {((inputs?: Portal_Expiry_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Expiry_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_expiry_note(inputs)
	return es_portal_expiry_note(inputs)
});