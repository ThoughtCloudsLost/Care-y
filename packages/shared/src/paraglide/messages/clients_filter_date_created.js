/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Clients_Filter_Date_CreatedInputs */

const en_clients_filter_date_created = /** @type {(inputs: Clients_Filter_Date_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date created`)
};

const es_clients_filter_date_created = /** @type {(inputs: Clients_Filter_Date_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fecha de creacion`)
};

/**
* | output |
* | --- |
* | "Date created" |
*
* @param {Clients_Filter_Date_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_filter_date_created = /** @type {((inputs?: Clients_Filter_Date_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Filter_Date_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_filter_date_created(inputs)
	return es_clients_filter_date_created(inputs)
});