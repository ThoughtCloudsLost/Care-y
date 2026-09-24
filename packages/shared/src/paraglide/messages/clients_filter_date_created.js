/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Clients_Filter_Date_CreatedInputs */

const en_clients_filter_date_created = /** @type {(inputs: Clients_Filter_Date_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date created`)
};

const es_clients_filter_date_created = /** @type {(inputs: Clients_Filter_Date_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fecha de creación`)
};

const en_xa2_clients_filter_date_created = /** @type {(inputs: Clients_Filter_Date_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàtè crèàtèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Date created" |
*
* @param {Clients_Filter_Date_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_filter_date_created = /** @type {((inputs?: Clients_Filter_Date_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Filter_Date_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_clients_filter_date_created(inputs)
	if (locale === "en-XA") return en_xa2_clients_filter_date_created(inputs)
	return en_clients_filter_date_created(inputs)
});