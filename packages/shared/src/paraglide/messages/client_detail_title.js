/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown> }} Client_Detail_TitleInputs */

const en_client_detail_title = /** @type {(inputs: Client_Detail_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} Detail`)
};

const es_client_detail_title = /** @type {(inputs: Client_Detail_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Detalle de ${i?.Client}`)
};

const en_xa2_client_detail_title = /** @type {(inputs: Client_Detail_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Client} Dètàìl •••⟧`)
};

/**
* | output |
* | --- |
* | "{Client} Detail" |
*
* @param {Client_Detail_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_detail_title = /** @type {((inputs: Client_Detail_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Detail_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_detail_title(inputs)
	if (locale === "en-XA") return en_xa2_client_detail_title(inputs)
	return en_client_detail_title(inputs)
});