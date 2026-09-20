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

const en_xa2_portal_expiry_note = /** @type {(inputs: Portal_Expiry_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèssàgès àrè rèmòvèd àftèr 30 dàys òf ìnàctìvìty. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Messages are removed after 30 days of inactivity." |
*
* @param {Portal_Expiry_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_expiry_note = /** @type {((inputs?: Portal_Expiry_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Expiry_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_expiry_note(inputs)
	if (locale === "en-XA") return en_xa2_portal_expiry_note(inputs)
	return en_portal_expiry_note(inputs)
});