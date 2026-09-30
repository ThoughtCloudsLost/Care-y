/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Privacy_DescInputs */

const en_demo_section_client_privacy_desc = /** @type {(inputs: Demo_Section_Client_Privacy_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The privacy notice is a static page of fixed text shared by every organization, with the organization's name and its own retention setting filled in per deployment. It states what data is collected, how long it is kept, and what rights the visitor has. The page holds no key material and performs no encryption. Every client page links to it from the drawer.`)
};

const es_demo_section_client_privacy_desc = /** @type {(inputs: Demo_Section_Client_Privacy_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El aviso de privacidad es una página estática con texto fijo compartido por todas las organizaciones, con el nombre de la organización y su propia configuración de retención completados por despliegue. Declara qué información se recopila, cuánto tiempo se conserva y qué derechos tiene el visitante. La página no contiene material de claves y no realiza cifrado. Todas las páginas del cliente enlazan a ella desde el menú lateral.`)
};

const en_xa2_demo_section_client_privacy_desc = /** @type {(inputs: Demo_Section_Client_Privacy_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè prìvàcy nòtìcè ìs à stàtìc pàgè òf fìxèd tèxt shàrèd by èvèry òrgànìzàtìòn, wìth thè òrgànìzàtìòn's nàmè ànd ìts òwn rètèntìòn sèttìng fìllèd ìn pèr dèplòymènt. Ìt stàtès whàt dàtà ìs còllèctèd, hòw lòng ìt ìs kèpt, ànd whàt rìghts thè vìsìtòr hàs. Thè pàgè hòlds nò kèy màtèrìàl ànd pèrfòrms nò èncryptìòn. Èvèry clìènt pàgè lìnks tò ìt fròm thè dràwèr. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The privacy notice is a static page of fixed text shared by every organization, with the organization's name and its own retention setting filled in per depl..." |
*
* @param {Demo_Section_Client_Privacy_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_privacy_desc = /** @type {((inputs?: Demo_Section_Client_Privacy_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Privacy_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_privacy_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_client_privacy_desc(inputs)
	return en_demo_section_client_privacy_desc(inputs)
});