/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Error_Portal_Channel_ExistsInputs */

const en_error_portal_channel_exists = /** @type {(inputs: Error_Portal_Channel_ExistsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This ${i?.client} already has an active secure link.`)
};

const es_error_portal_channel_exists = /** @type {(inputs: Error_Portal_Channel_ExistsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Este ${i?.client} ya tiene un enlace seguro activo.`)
};

const en_xa2_error_portal_channel_exists = /** @type {(inputs: Error_Portal_Channel_ExistsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs  ••${i?.client} àlrèàdy hàs àn àctìvè sècùrè lìnk. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This {client} already has an active secure link." |
*
* @param {Error_Portal_Channel_ExistsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_portal_channel_exists = /** @type {((inputs: Error_Portal_Channel_ExistsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Channel_ExistsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_portal_channel_exists(inputs)
	if (locale === "en-XA") return en_xa2_error_portal_channel_exists(inputs)
	return en_error_portal_channel_exists(inputs)
});