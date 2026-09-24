/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Preview_Unlock_FailedInputs */

const en_preview_unlock_failed = /** @type {(inputs: Preview_Unlock_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not unlock this preview`)
};

const es_preview_unlock_failed = /** @type {(inputs: Preview_Unlock_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo desbloquear esta vista previa`)
};

const en_xa2_preview_unlock_failed = /** @type {(inputs: Preview_Unlock_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt ùnlòck thìs prèvìèw •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not unlock this preview" |
*
* @param {Preview_Unlock_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const preview_unlock_failed = /** @type {((inputs?: Preview_Unlock_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Preview_Unlock_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_preview_unlock_failed(inputs)
	if (locale === "en-XA") return en_xa2_preview_unlock_failed(inputs)
	return en_preview_unlock_failed(inputs)
});