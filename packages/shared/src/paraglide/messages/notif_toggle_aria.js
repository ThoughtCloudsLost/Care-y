/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ channel: NonNullable<unknown>, event: NonNullable<unknown> }} Notif_Toggle_AriaInputs */

const en_notif_toggle_aria = /** @type {(inputs: Notif_Toggle_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.channel} for ${i?.event}`)
};

const es_notif_toggle_aria = /** @type {(inputs: Notif_Toggle_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.channel} para ${i?.event}`)
};

/**
* | output |
* | --- |
* | "{channel} for {event}" |
*
* @param {Notif_Toggle_AriaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_toggle_aria = /** @type {((inputs: Notif_Toggle_AriaInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Toggle_AriaInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_toggle_aria(inputs)
	return es_notif_toggle_aria(inputs)
});