/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Sse_Always_OnInputs */

const en_notif_sse_always_on = /** @type {(inputs: Notif_Sse_Always_OnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`In-app alerts are always on.`)
};

const es_notif_sse_always_on = /** @type {(inputs: Notif_Sse_Always_OnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las alertas en la aplicación siempre estan activas.`)
};

const en_xa2_notif_sse_always_on = /** @type {(inputs: Notif_Sse_Always_OnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìn-àpp àlèrts àrè àlwàys òn. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "In-app alerts are always on." |
*
* @param {Notif_Sse_Always_OnInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_sse_always_on = /** @type {((inputs?: Notif_Sse_Always_OnInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Sse_Always_OnInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_sse_always_on(inputs)
	if (locale === "en-XA") return en_xa2_notif_sse_always_on(inputs)
	return en_notif_sse_always_on(inputs)
});