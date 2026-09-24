/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Preset_Reply_Not_FoundInputs */

const en_error_preset_reply_not_found = /** @type {(inputs: Error_Preset_Reply_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preset reply not found.`)
};

const es_error_preset_reply_not_found = /** @type {(inputs: Error_Preset_Reply_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta predefinida no encontrada.`)
};

const en_xa2_error_preset_reply_not_found = /** @type {(inputs: Error_Preset_Reply_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prèsèt rèply nòt fòùnd. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Preset reply not found." |
*
* @param {Error_Preset_Reply_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_preset_reply_not_found = /** @type {((inputs?: Error_Preset_Reply_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Preset_Reply_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_preset_reply_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_preset_reply_not_found(inputs)
	return en_error_preset_reply_not_found(inputs)
});