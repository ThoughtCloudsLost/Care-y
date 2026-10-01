/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Assist_Note_PlaceholderInputs */

const en_assist_note_placeholder = /** @type {(inputs: Assist_Note_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What was it for? (optional)`)
};

const es_assist_note_placeholder = /** @type {(inputs: Assist_Note_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Para qué fue? (opcional)`)
};

const en_xa2_assist_note_placeholder = /** @type {(inputs: Assist_Note_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whàt wàs ìt fòr? (òptìònàl) •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "What was it for? (optional)" |
*
* @param {Assist_Note_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_note_placeholder = /** @type {((inputs?: Assist_Note_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Assist_Note_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_assist_note_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_assist_note_placeholder(inputs)
	return en_assist_note_placeholder(inputs)
});