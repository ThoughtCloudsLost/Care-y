/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Share_DescInputs */

const en_demo_section_client_share_desc = /** @type {(inputs: Demo_Section_Client_Share_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A single use readable message sent to someone outside the system. The content is encrypted under a fresh random key that lives only in the URL fragment, and the link expires after one open or after its time window closes.`)
};

const es_demo_section_client_share_desc = /** @type {(inputs: Demo_Section_Client_Share_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un mensaje legible de un solo uso enviado a alguien fuera del sistema. El contenido se cifra con una clave aleatoria nueva que vive solo en el fragmento de la URL, y el enlace expira después de abrirse una vez o después de que se cierre su ventana de tiempo.`)
};

const en_xa2_demo_section_client_share_desc = /** @type {(inputs: Demo_Section_Client_Share_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À sìnglè ùsè rèàdàblè mèssàgè sènt tò sòmèònè òùtsìdè thè systèm. Thè còntènt ìs èncryptèd ùndèr à frèsh ràndòm kèy thàt lìvès ònly ìn thè ÙRL fràgmènt, ànd thè lìnk èxpìrès àftèr ònè òpèn òr àftèr ìts tìmè wìndòw clòsès. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A single use readable message sent to someone outside the system. The content is encrypted under a fresh random key that lives only in the URL fragment, and ..." |
*
* @param {Demo_Section_Client_Share_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_share_desc = /** @type {((inputs?: Demo_Section_Client_Share_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Share_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_share_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_client_share_desc(inputs)
	return en_demo_section_client_share_desc(inputs)
});