/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ done: NonNullable<unknown>, total: NonNullable<unknown> }} Reseal_Banner_ProgressInputs */

const en_reseal_banner_progress = /** @type {(inputs: Reseal_Banner_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Finishing key update: ${i?.done} of ${i?.total} items. You can keep working; leave the app open if you can.`)
};

const es_reseal_banner_progress = /** @type {(inputs: Reseal_Banner_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Finalizando la actualización de claves: ${i?.done} de ${i?.total} elementos. Puedes seguir trabajando; deja la aplicación abierta si puedes.`)
};

const en_xa2_reseal_banner_progress = /** @type {(inputs: Reseal_Banner_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Fìnìshìng kèy ùpdàtè:  •••••••${i?.done} òf  ••${i?.total} ìtèms. Yòù càn kèèp wòrkìng; lèàvè thè àpp òpèn ìf yòù càn. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Finishing key update: {done} of {total} items. You can keep working; leave the app open if you can." |
*
* @param {Reseal_Banner_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reseal_banner_progress = /** @type {((inputs: Reseal_Banner_ProgressInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reseal_Banner_ProgressInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reseal_banner_progress(inputs)
	if (locale === "en-XA") return en_xa2_reseal_banner_progress(inputs)
	return en_reseal_banner_progress(inputs)
});