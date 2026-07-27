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

/**
* | output |
* | --- |
* | "{Client} Detail" |
*
* @param {Client_Detail_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_detail_title = /** @type {((inputs: Client_Detail_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Detail_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_detail_title(inputs)
	return es_client_detail_title(inputs)
});