/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_Encrypted_WhatInputs */

const en_intake_protected_encrypted_what = /** @type {(inputs: Intake_Protected_Encrypted_WhatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your information is encrypted in your browser before it is sent. The server receives only scrambled data it cannot read.`)
};

const es_intake_protected_encrypted_what = /** @type {(inputs: Intake_Protected_Encrypted_WhatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu informacion se cifra en tu navegador antes de enviarse. El servidor solo recibe datos codificados que no puede leer.`)
};

/**
* | output |
* | --- |
* | "Your information is encrypted in your browser before it is sent. The server receives only scrambled data it cannot read." |
*
* @param {Intake_Protected_Encrypted_WhatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_encrypted_what = /** @type {((inputs?: Intake_Protected_Encrypted_WhatInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_Encrypted_WhatInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_protected_encrypted_what(inputs)
	return es_intake_protected_encrypted_what(inputs)
});