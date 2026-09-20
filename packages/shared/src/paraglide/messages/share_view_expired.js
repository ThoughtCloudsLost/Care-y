/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_ExpiredInputs */

const en_share_view_expired = /** @type {(inputs: Share_View_ExpiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link has expired and is no longer available.`)
};

const es_share_view_expired = /** @type {(inputs: Share_View_ExpiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace ha expirado y ya no está disponible.`)
};

const en_xa2_share_view_expired = /** @type {(inputs: Share_View_ExpiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs lìnk hàs èxpìrèd ànd ìs nò lòngèr àvàìlàblè. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This link has expired and is no longer available." |
*
* @param {Share_View_ExpiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_expired = /** @type {((inputs?: Share_View_ExpiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_ExpiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_view_expired(inputs)
	if (locale === "en-XA") return en_xa2_share_view_expired(inputs)
	return en_share_view_expired(inputs)
});