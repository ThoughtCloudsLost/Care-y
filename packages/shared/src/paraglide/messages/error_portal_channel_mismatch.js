/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Portal_Channel_MismatchInputs */

const en_error_portal_channel_mismatch = /** @type {(inputs: Error_Portal_Channel_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The secure link changed while recovering history. Generate a new link to continue.`)
};

const es_error_portal_channel_mismatch = /** @type {(inputs: Error_Portal_Channel_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El enlace seguro cambió mientras se recuperaba el historial. Genera un nuevo enlace para continuar.`)
};

const en_xa2_error_portal_channel_mismatch = /** @type {(inputs: Error_Portal_Channel_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sècùrè lìnk chàngèd whìlè rècòvèrìng hìstòry. Gènèràtè à nèw lìnk tò còntìnùè. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The secure link changed while recovering history. Generate a new link to continue." |
*
* @param {Error_Portal_Channel_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_portal_channel_mismatch = /** @type {((inputs?: Error_Portal_Channel_MismatchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Channel_MismatchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_portal_channel_mismatch(inputs)
	if (locale === "en-XA") return en_xa2_error_portal_channel_mismatch(inputs)
	return en_error_portal_channel_mismatch(inputs)
});